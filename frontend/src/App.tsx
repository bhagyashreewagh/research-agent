import { useState, useRef, useCallback } from "react";
import AgentFeed, { AgentEvent } from "./components/AgentFeed";
import Report from "./components/Report";

const EXAMPLE_QUERIES = [
  "What are the latest breakthroughs in quantum computing in 2024?",
  "How is AI changing drug discovery in biotech?",
  "What's the current state of fusion energy research?",
  "How do large language models work, and what are their limitations?",
];

export default function App() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startResearch = useCallback(async (q: string) => {
    if (!q.trim() || isRunning) return;

    // Reset state
    setEvents([]);
    setReport(null);
    setError(null);
    setIsRunning(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev: AgentEvent = JSON.parse(line.slice(6));
            if (ev.type === "report") {
              setReport(ev.content);
            } else if (ev.type === "done") {
              setIsRunning(false);
            } else if (ev.type === "error") {
              setError(ev.content);
              setIsRunning(false);
            } else {
              setEvents(prev => [...prev, ev]);
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setIsRunning(false);
    }
  }, [isRunning]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startResearch(query);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-800/60 px-6 py-4 flex items-center gap-3">
        <span className="text-brand-400 text-xl">⬡</span>
        <span className="font-semibold text-slate-100 tracking-tight">Research Agent</span>
        <span className="ml-auto text-xs text-slate-600">powered by Claude</span>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-16">
        {/* Hero */}
        {events.length === 0 && !report && (
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center gap-2 bg-brand-900/30 border border-brand-800/50 rounded-full px-4 py-1.5 text-xs text-brand-400 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 pulse-dot" />
              Autonomous multi-step research
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-50 tracking-tight mb-4">
              Ask anything.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-violet-400">
                Get deep research.
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              The agent searches the web, reads sources, and writes a comprehensive cited report — automatically.
            </p>
          </div>
        )}

        {/* Query form */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
          <div className="relative flex items-center bg-slate-900 border border-slate-700 focus-within:border-brand-600 rounded-2xl transition-colors shadow-xl shadow-black/30">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What do you want to research?"
              disabled={isRunning}
              className="flex-1 bg-transparent px-6 py-5 text-slate-100 placeholder:text-slate-600 outline-none text-base disabled:opacity-60"
            />
            {isRunning ? (
              <button
                type="button"
                onClick={handleStop}
                className="mr-3 px-5 py-2.5 rounded-xl bg-red-900/60 hover:bg-red-800/60 border border-red-800 text-red-300 text-sm font-medium transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!query.trim()}
                className="mr-3 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                Research
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Example queries — only show before first run */}
        {events.length === 0 && !report && (
          <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-2xl fade-in">
            {EXAMPLE_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => { setQuery(q); startResearch(q); }}
                className="text-xs text-slate-500 hover:text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-full px-4 py-2 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="w-full max-w-3xl mt-6 fade-in">
            <div className="bg-red-950/50 border border-red-900 rounded-xl px-5 py-4 text-red-300 text-sm flex items-center gap-3">
              <span>⚠️</span> {error}
            </div>
          </div>
        )}

        {/* Live agent feed */}
        <AgentFeed events={events} isRunning={isRunning} />

        {/* Final report */}
        {report && <Report content={report} />}

        {/* New research button after done */}
        {report && !isRunning && (
          <button
            onClick={() => { setEvents([]); setReport(null); setQuery(""); }}
            className="mt-10 text-sm text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-600 rounded-xl px-5 py-2.5 transition-colors fade-in"
          >
            ← New Research
          </button>
        )}
      </main>

      <footer className="border-t border-slate-800/60 px-6 py-4 text-center text-xs text-slate-700">
        Research Agent · Built with Claude + Tavily · Deployed on Railway
      </footer>
    </div>
  );
}
