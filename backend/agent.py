import json
import os
from typing import AsyncGenerator

import anthropic

from .tools import search_web, scrape_page

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

# ── Tool schemas ──────────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "search_web",
        "description": (
            "Search the web for up-to-date information. "
            "Returns titles, URLs, and snippets. "
            "Call this multiple times with different queries to get broad coverage."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Precise search query",
                }
            },
            "required": ["query"],
        },
    },
    {
        "name": "scrape_page",
        "description": (
            "Fetch and read the full text of a specific web page. "
            "Use this on the most relevant URLs found in search results "
            "to get deeper detail, statistics, or quotes."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The full URL to scrape",
                }
            },
            "required": ["url"],
        },
    },
]

SYSTEM_PROMPT = """You are an expert research agent. Your mission: conduct thorough, multi-source research and produce a comprehensive, well-cited report.

Process:
1. Break the query into sub-topics worth investigating.
2. Call search_web at least 4-6 times with varied, specific queries to get broad coverage.
3. Call scrape_page on the 2-4 most informative URLs to get full details, statistics, and direct quotes.
4. After gathering enough evidence, write your final report.

Final report format (markdown):
## Executive Summary
(2-3 sentence overview)

## Key Findings
### [Topic 1]
...facts, stats, quotes with [Source: URL] citations...

### [Topic 2]
...

## Analysis & Implications
...

## Sources
- [Title](URL)
- ...

Rules:
- Every factual claim must cite a source: [Source: URL]
- Include specific numbers, dates, and names — no vague generalities
- Aim for depth: a great report is 600–1200 words
- Do NOT rush to write the report before searching at least 4 times"""


async def run_research_agent(query: str) -> AsyncGenerator[str, None]:
    """Yield SSE-formatted strings as the agent works."""

    def event(payload: dict) -> str:
        return f"data: {json.dumps(payload)}\n\n"

    yield event({"type": "status", "content": f'Researching: "{query}"'})

    messages: list[dict] = [{"role": "user", "content": query}]
    max_iterations = 20

    for iteration in range(max_iterations):
        yield event({"type": "thinking", "content": "Planning next steps…"})

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8096,
            system=SYSTEM_PROMPT,
            tools=TOOLS,  # type: ignore[arg-type]
            messages=messages,  # type: ignore[arg-type]
        )

        # Separate text blocks from tool calls
        tool_calls = [b for b in response.content if b.type == "tool_use"]
        text_blocks = [b for b in response.content if b.type == "text"]

        # If the agent is done (no tool calls) → final report
        if not tool_calls:
            final_text = "\n\n".join(b.text for b in text_blocks).strip()
            if final_text:
                yield event({"type": "report", "content": final_text})
            yield event({"type": "done"})
            return

        # Add the assistant turn (tool calls + any inline text)
        messages.append({"role": "assistant", "content": response.content})

        # Execute each tool call
        tool_results = []
        for tc in tool_calls:
            name = tc.name
            args = tc.input

            if name == "search_web":
                q = args["query"]
                yield event({"type": "searching", "query": q})
                result = await search_web(q)
                count = len(result.get("results", []))
                yield event({"type": "search_done", "query": q, "count": count,
                             "results": result.get("results", [])[:3]})
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tc.id,
                    "content": json.dumps(result),
                })

            elif name == "scrape_page":
                url = args["url"]
                yield event({"type": "scraping", "url": url})
                text = await scrape_page(url)
                yield event({"type": "scrape_done", "url": url,
                             "chars": len(text)})
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tc.id,
                    "content": text,
                })

        messages.append({"role": "user", "content": tool_results})

    yield event({"type": "error", "content": "Reached maximum iterations."})
