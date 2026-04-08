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
        <div className="flex items-center gap-3 text-sm fade-in" style={{ color: "#6B5B52" }}>
          <span style={{ color: "#8B6B5B" }}>◎</span>
          <span>{ev.content}</span>
        </div>
      );
    case "thinking":
      return (
        <div className="flex items-center gap-3 text-sm italic fade-in" style={{ color: "#9C8C82" }}>
          <span style={{ color: "#C8BAB0" }}>·</span>
          <span>{ev.content}</span>
        </div>
      );
    case "searching":
      return (
        <div className="flex items-start gap-3 fade-in">
          <span className="mt-0.5 text-sm" style={{ color: "#8B6B5B" }}>⌕</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-0.5" style={{ color: "#8B6B5B", letterSpacing: "0.1em" }}>Searching</p>
            <p className="text-sm" style={{ color: "#1C1410" }}>{ev.query}</p>
          </div>
        </div>
      );
    case "search_done":
      return (
        <div className="pl-6 fade-in">
          <p className="text-xs mb-1.5" style={{ color: "#9C8C82" }}>Found {ev.count} sources</p>
          <div className="flex flex-wrap gap-1.5">
            {ev.results.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs rounded-full px-3 py-1 transition-colors"
                style={{ background: "#F2EDE6", color: "#7A5A4A", border: "1px solid #E0D6CC" }}
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
          <span className="mt-0.5 text-sm" style={{ color: "#B8917E" }}>↗</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-0.5" style={{ color: "#B8917E", letterSpacing: "0.1em" }}>Reading</p>
            <p className="text-xs font-mono" style={{ color: "#9C8C82" }}>{hostname(ev.url)}</p>
          </div>
        </div>
      );
    case "scrape_done":
      return (
        <div className="pl-6 fade-in">
          <p className="text-xs" style={{ color: "#9C8C82" }}>
            ✓ Read {(ev.chars / 1000).toFixed(1)}k chars
          </p>
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-3 text-sm fade-in" style={{ color: "#B05040" }}>
          <span>x</span><span>{ev.content}</span>
        </div>
      );
    default:
      return null;
  }
}

export default function AgentFeed({ events, isRunning }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1" style={{ background: "#E8E0D6" }} />
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "#9C8C82", letterSpacing: "0.12em" }}>
            Agent Activity
          </span>
          {isRunning && (
            <span className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1 h-1 rounded-full pulse-dot"
                  style={{ background: "#8B6B5B", animationDelay: `${i * 0.2}s` }} />
              ))}
            </span>
          )}
        </div>
        <div className="h-px flex-1" style={{ background: "#E8E0D6" }} />
      </div>

      <div
        className="space-y-3 rounded-2xl p-6 max-h-64 overflow-y-auto scrollbar-thin"
        style={{ background: "#F7F3EF", border: "1px solid #E8E0D6" }}
      >
        {events
          .filter(e => e.type !== "report" && e.type !== "done")
          .map((ev, i) => <Step key={i} ev={ev} />)}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
