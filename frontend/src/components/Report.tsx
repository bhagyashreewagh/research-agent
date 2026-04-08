import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export default function Report({ content }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-10 fade-in">
      {/* Header bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-700 to-transparent" />
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-500 px-3">
          Research Report
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-brand-700 to-transparent" />
      </div>

      {/* Copy button */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => navigator.clipboard.writeText(content)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>

      {/* Report body */}
      <div className="report-body bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
