import { useEffect, useRef } from "react";

export type AgentEvent =
  | { type: "status"; content: string }
  | { type: "thinking"; content: string }
  | { type: "searching"; query: string }
  | { type: "search_done"; query: string; count: number; results: { title: string; url: string }[] }
  | { type: "scraping"; url: string }
  | { type: "scrape_done"; url: string; chars: number }
  | { type: "error"; content: string }
  | { type: "report"; content: string }
  | { type: "done" };

interface Props {
  events: AgentEvent[];
  isRunning: boolean;
}

function hostname(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

function Step({ ev }: { ev: AgentEvent }) {
  switch (ev.type) {
    case "status":
      return (
        <div className="flex items-center gap-3 text-slate-400 text-sm fade-in">
          <span className="text-brand-400 text-lg">🔬</span>
          <span>{ev.content}</span>
        </div>
      );
    case "thinking":
      return (
        <div className="flex items-center gap-3 text-slate-500 text-sm fade-in">
          <span className="text-slate-400 text-base">💭</span>
          <span className="italic">{ev.content}</span>
        </div>
      );
    case "searching":
      return (
        <div className="flex items-start gap-3 fade-in">
          <span className="mt-0.5 text-brand-400 text-base">🔍</span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">Searching</span>
            <p className="text-slate-200 text-sm mt-0.5">{ev.query}</p>
          </div>
        </div>
      );
    case "search_done":
      return (
        <div className="pl-7 fade-in">
          <p className="text-xs text-slate-500 mb-1.5">Found {ev.count} results</p>
          <div className="flex flex-wrap gap-2">
            {ev.results.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full px-3 py-1 text-brand-300 hover:text-brand-200 transition-colors"
              >
                {hostname(r.url)}
              </a>
            ))}
          </div>
        </div>
      );
    case "scraping":
      return (
        <div className="flex items-start gap-3 fade-in">
          <span className="mt-0.5 text-violet-400 text-base">📄</span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">Reading page</span>
            <p className="text-slate-400 text-xs mt-0.5 font-mono truncate max-w-sm">{hostname(ev.url)}</p>
          </div>
        </div>
      );
    case "scrape_done":
      return (
        <div className="pl-7 fade-in">
          <p className="text-xs text-slate-500">
            ✓ Read {(ev.chars / 1000).toFixed(1)}k chars from {hostname(ev.url)}
          </p>
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-3 text-red-400 text-sm fade-in">
          <span>⚠️</span><span>{ev.content}</span>
        </div>
      );
    default:
      return null;
  }
}

export default function AgentFeed({ events, isRunning }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Agent Activity</span>
        {isRunning && (
          <span className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-brand-400 pulse-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        )}
      </div>

      <div className="space-y-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 max-h-72 overflow-y-auto scrollbar-thin">
        {events
          .filter(e => e.type !== "report" && e.type !== "done")
          .map((ev, i) => (
            <Step key={i} ev={ev} />
          ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
