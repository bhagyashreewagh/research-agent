# Research Agent

An autonomous AI research agent powered by the Claude API. Give it any question and it searches the web, reads sources, and writes a comprehensive cited report, all on its own.

**Live demo:** https://research-agent-fk51.onrender.com

![Research Agent UI](docs/screenshot.png)

---

## What it does

1. You type a research question
2. Claude decides what to search for
3. It calls the Tavily search API and picks the best sources
4. It scrapes and reads those pages
5. It decides whether it needs more info or is ready to write
6. It produces a full markdown report with citations

The entire process streams live to the UI so you can watch it think, search, and read in real time.

---

## Tech stack

| Layer | Technology |
|---|---|
| AI | Claude claude-sonnet-4-6 (Anthropic API tool use) |
| Search | Tavily Search API |
| Backend | FastAPI + Python, Server-Sent Events (SSE) |
| Frontend | React 18 + Vite + Tailwind CSS |
| Deployment | Render (free tier) |

---

## How it works

The core is a **single agentic loop** using Claude's tool use API:

```python
# Claude decides which tools to call, in what order, until it's ready to write
tools = [
    { "name": "search_web",  "description": "Search the web via Tavily" },
    { "name": "scrape_page", "description": "Read a webpage's content" },
]

# Loop: call Claude → execute tools → feed results back → repeat
while response.stop_reason == "tool_use":
    tool_results = await execute_tools(response.content)
    response = await call_claude(messages + tool_results)
```

Results stream from FastAPI to the React frontend via SSE, so the UI updates in real time as the agent works.

---

## Running locally

**1. Clone and set up env vars**

```bash
git clone https://github.com/bhagyashreewagh/research-agent.git
cd research-agent
```

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
```

**2. Start the backend**

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

**3. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Project structure

```
research-agent/
├── backend/
│   ├── main.py        # FastAPI app + SSE endpoint
│   ├── agent.py       # Agentic Claude loop
│   ├── tools.py       # search_web + scrape_page tools
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.tsx
│       └── components/
│           ├── AgentFeed.tsx   # Live activity stream
│           └── Report.tsx      # Rendered markdown report
└── .env
```

---

## API keys needed

- **Anthropic API key**: https://console.anthropic.com
- **Tavily API key**: https://tavily.com (free tier available)
