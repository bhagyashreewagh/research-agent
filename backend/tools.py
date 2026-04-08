import os
from typing import Optional
import httpx
from bs4 import BeautifulSoup
from tavily import TavilyClient

_tavily: Optional[TavilyClient] = None


def _get_tavily() -> TavilyClient:
    global _tavily
    if _tavily is None:
        _tavily = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
    return _tavily


async def search_web(query: str, max_results: int = 6) -> dict:
    """Search the web using Tavily and return structured results."""
    try:
        client = _get_tavily()
        response = client.search(
            query=query,
            max_results=max_results,
            include_answer=True,
            include_raw_content=False,
        )
        return {
            "query": query,
            "answer": response.get("answer", ""),
            "results": [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "snippet": r.get("content", "")[:500],
                    "score": r.get("score", 0),
                }
                for r in response.get("results", [])
            ],
        }
    except Exception as e:
        return {"query": query, "error": str(e), "results": []}


async def scrape_page(url: str, max_chars: int = 6000) -> str:
    """Scrape and clean text content from a URL."""
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove noise
        for tag in soup(["script", "style", "nav", "footer", "header",
                          "aside", "iframe", "noscript", "form"]):
            tag.decompose()

        # Extract readable text
        text = soup.get_text(separator="\n", strip=True)
        # Collapse blank lines
        lines = [ln for ln in text.splitlines() if ln.strip()]
        clean = "\n".join(lines)
        return clean[:max_chars]

    except Exception as e:
        return f"[Error scraping {url}: {e}]"
