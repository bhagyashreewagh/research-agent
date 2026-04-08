import { useState, useRef, useCallback } from "react";
import AgentFeed, { AgentEvent } from "./components/AgentFeed";
import Report from "./components/Report";

const EXAMPLE_QUERIES = [
  "What are the latest breakthroughs in quantum computing?",
  "How is AI transforming drug discovery in biotech?",
  "What is the current state of fusion energy research?",
  "How do large language models work, and what are their limits?",
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
      if (!res.ok || !res.body) throw new Error(`Server error: ${res.status}`);

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
            if (ev.type === "report") setReport(ev.content);
            else if (ev.type === "done") setIsRunning(false);
            else if (ev.type === "error") { setError(ev.content); setIsRunning(false); }
            else setEvents(prev => [...prev, ev]);
          } catch { /* skip */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") setError(err.message);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); startResearch(query); };
  const handleStop = () => { abortRef.current?.abort(); setIsRunning(false); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF8F5" }}>

      {/* Nav */}
      <nav
        className="px-8 py-5 flex items-center gap-3"
        style={{ borderBottom: "1px solid #E8E0D6" }}
      >
        <span style={{ color: "#8B6B5B", fontSize: "1.1rem" }}>◎</span>
        <span
          className="tracking-tight"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.15rem", fontWeight: 500, color: "#1C1410", letterSpacing: "0.02em" }}
        >
          Research Agent
        </span>
        <span className="ml-auto text-xs" style={{ color: "#C8BAB0", fontFamily: "Inter", letterSpacing: "0.05em" }}>
          powered by Claude
        </span>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-20">

        {/* Hero — only shown before first run */}
        {events.length === 0 && !report && (
          <div className="text-center mb-12 fade-in">
            <p
              className="text-xs uppercase tracking-widest mb-5"
              style={{ color: "#9C8C82", letterSpacing: "0.16em", fontFamily: "Inter" }}
            >
              Autonomous multi-step research
            </p>
            <h1
              className="mb-5 leading-tight"
              style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
                fontWeight: 300,
                color: "#1C1410",
                letterSpacing: "-0.01em",
              }}
            >
              Ask anything.<br />
              <span style={{ color: "#8B6B5B", fontStyle: "italic" }}>Get deep research.</span>
            </h1>
            <p
              className="max-w-md mx-auto"
              style={{ color: "#6B5B52", fontSize: "1rem", lineHeight: 1.7, fontFamily: "Inter", fontWeight: 300 }}
            >
              The agent searches the web, reads sources, and writes a comprehensive cited report. Automatically.
            </p>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <div
            className="relative flex items-center transition-all"
            style={{
              background: "#FFFFFF",
              border: "1px solid #DDD3C8",
              borderRadius: "16px",
              boxShadow: "0 2px 16px rgba(139,107,91,0.06)",
            }}
          >
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What do you want to research?"
              disabled={isRunning}
              className="flex-1 bg-transparent outline-none disabled:opacity-50"
              style={{
                padding: "1.1rem 1.5rem",
                fontFamily: "Inter",
                fontSize: "0.95rem",
                color: "#1C1410",
              }}
            />
            {isRunning ? (
              <button
                type="button"
                onClick={handleStop}
                className="mr-3 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: "#F2EDE6", color: "#7A5A4A", border: "1px solid #DDD3C8" }}
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!query.trim()}
                className="mr-3 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                style={{
                  background: query.trim() ? "#8B6B5B" : "#E8E0D6",
                  color: query.trim() ? "#FFFFFF" : "#9C8C82",
                  border: "none",
                  fontFamily: "Inter",
                }}
              >
                Research
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Example queries */}
        {events.length === 0 && !report && (
          <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-xl fade-in">
            {EXAMPLE_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => { setQuery(q); startResearch(q); }}
                className="text-xs rounded-full px-4 py-2 transition-colors text-left"
                style={{ background: "#F2EDE6", color: "#7A5A4A", border: "1px solid #E0D6CC" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#EAE1D8")}
                onMouseLeave={e => (e.currentTarget.style.background = "#F2EDE6")}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="w-full max-w-2xl mt-6 rounded-xl px-5 py-4 text-sm fade-in"
            style={{ background: "#FDF2F0", border: "1px solid #E8C8C0", color: "#8B3020" }}
          >
            {error}
          </div>
        )}

        {/* Agent feed */}
        <AgentFeed events={events} isRunning={isRunning} />

        {/* Report */}
        {report && <Report content={report} />}

        {/* New research */}
        {report && !isRunning && (
          <button
            onClick={() => { setEvents([]); setReport(null); setQuery(""); }}
            className="mt-10 text-sm transition-colors rounded-xl px-5 py-2.5 fade-in"
            style={{ color: "#9C8C82", border: "1px solid #E0D6CC", background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#6B5B52")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9C8C82")}
          >
            ← New Research
          </button>
        )}
      </main>

      <footer
        className="px-8 py-5 text-center text-xs"
        style={{ borderTop: "1px solid #E8E0D6", color: "#C8BAB0", fontFamily: "Inter", letterSpacing: "0.04em" }}
      >
        Research Agent · Built with Claude + Tavily · Deployed on Render
      </footer>
    </div>
  );
}
