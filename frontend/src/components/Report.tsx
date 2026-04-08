import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props { content: string; }

export default function Report({ content }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12 fade-in">
      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1" style={{ background: "#E8E0D6" }} />
        <span
          className="text-xs uppercase tracking-widest font-medium"
          style={{ color: "#9C8C82", letterSpacing: "0.14em", fontFamily: "Inter" }}
        >
          Research Report
        </span>
        <div className="h-px flex-1" style={{ background: "#E8E0D6" }} />
      </div>

      {/* Copy button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigator.clipboard.writeText(content)}
          className="flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-lg"
          style={{ color: "#9C8C82", border: "1px solid #E0D6CC", background: "transparent" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#6B5B52")}
          onMouseLeave={e => (e.currentTarget.style.color = "#9C8C82")}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>

      {/* Report */}
      <div
        className="report-body rounded-2xl px-10 py-10"
        style={{ background: "#FFFFFF", border: "1px solid #E8E0D6", boxShadow: "0 2px 24px rgba(139,107,91,0.06)" }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
