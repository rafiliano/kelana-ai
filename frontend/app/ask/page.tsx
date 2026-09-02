"use client";

import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { askQuestion } from "@/services/askService";
import ReactMarkdown from "react-markdown";

function getFileName(source: any): string {
  const uri = source?.location?.s3Location?.uri
           || source?.location?.webLocation?.url
           || source?.document_id
           || null;

  if (!uri) return "Unknown source";

  // Extract just the filename from S3 URI or URL
  const parts = uri.split("/");
  return parts[parts.length - 1] || uri;
}

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult]     = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await askQuestion(question);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAsk();
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">
      <NavBar />

      <main className="flex-1 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-3xl flex flex-col gap-6">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e]"
                style={{ fontFamily: "var(--font-cinzel)" }}>
              Ask the Travel AI
            </h2>
            <p className="text-[#94a3b8] text-sm mt-2 uppercase tracking-widest">
              Powered by your Knowledge Base
            </p>
          </div>

          {/* Search bar */}
          <div className="bg-white border border-[#e2e8f0] shadow-sm flex items-center gap-3 p-3">
            <span className="text-[#c0392b] text-lg flex-shrink-0">✦</span>
            <input
              value       = {question}
              onChange    = {(e) => setQuestion(e.target.value)}
              onKeyDown   = {handleKeyDown}
              placeholder = "e.g. Do I need a visa to visit Japan?"
              className   = "flex-1 bg-transparent outline-none text-[#1a1a2e] placeholder-[#cbd5e1] text-sm"
            />
            <button
              onClick   = {handleAsk}
              disabled  = {loading || !question.trim()}
              className = "bg-[#c0392b] text-white text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-[#a93226] transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="border border-[#c0392b] bg-[#fdf2f2] p-4 text-[#c0392b] text-xs uppercase tracking-widest">
              ⚠ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white border border-[#e2e8f0] p-8 flex flex-col items-center gap-4 shadow-sm">
              <div className="flex gap-2">
                {[0,1,2].map(i => (
                  <div
                    key       = {i}
                    className = "w-2 h-2 bg-[#c0392b] rounded-full animate-bounce"
                    style     = {{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <p className="text-[#94a3b8] text-xs uppercase tracking-widest">
                Searching knowledge base...
              </p>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="flex flex-col gap-4">

              {/* Question recap */}
              <div className="bg-[#fdf2f2] border border-[#c0392b]/20 px-4 py-3">
                <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Your Question</p>
                <p className="text-[#1a1a2e] text-sm font-medium">{result.question}</p>
              </div>

              {/* No relevant answer */}
              {!result.answer ? (
                <div className="bg-white border border-[#e2e8f0] p-6 shadow-sm text-center">
                  <p className="text-[#c9a84c] text-2xl mb-3">✦</p>
                  <p className="text-[#64748b] text-sm">{result.message}</p>
                  <p className="text-[#94a3b8] text-xs mt-2 uppercase tracking-widest">
                    Relevance score: {(result.top_score * 100).toFixed(0)}%
                  </p>
                </div>
              ) : (
                <>
                  {/* Answer */}
                  <div className="bg-white border border-[#e2e8f0] border-l-4 border-l-[#c0392b] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e2e8f0]">
                      <p className="text-xs text-[#c0392b] uppercase tracking-widest font-bold"
                         style={{ fontFamily: "var(--font-cinzel)" }}>
                        ✦ Answer
                      </p>
                      <span className="text-xs text-[#94a3b8] uppercase tracking-widest">
                        Relevance: {(result.top_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none
                      prose-headings:text-[#1a1a2e] prose-headings:font-bold
                      prose-p:text-[#334155] prose-p:leading-relaxed
                      prose-li:text-[#475569] prose-li:marker:text-[#c0392b]
                      prose-strong:text-[#1a1a2e]">
                      <ReactMarkdown>{result.answer}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Sources */}
                  {result.sources && result.sources.length > 0 && (
                    <div className="bg-white border border-[#e2e8f0] p-4 shadow-sm">
                      <p className="text-xs text-[#94a3b8] uppercase tracking-widest mb-3 font-bold">
                        Sources Used
                      </p>
                      <div className="flex flex-col gap-2">
                        {result.sources.map((source: any, i: number) => (
                          <div
                            key       = {i}
                            className = "flex items-center justify-between border border-[#e2e8f0] px-3 py-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[#c0392b]">📄</span>
                              <span className="text-[#475569] font-medium">
                                {getFileName(source)}
                              </span>
                            </div>
                            <span className={`font-bold px-2 py-0.5 text-xs border ${
                              (source.score || 0) >= 0.8
                                ? "border-[#c0392b] text-[#c0392b] bg-[#fdf2f2]"
                                : (source.score || 0) >= 0.6
                                ? "border-[#c9a84c] text-[#c9a84c] bg-[#fffbeb]"
                                : "border-[#94a3b8] text-[#94a3b8]"
                            }`}>
                              {((source.score || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && !error && (
            <div className="bg-white border border-[#e2e8f0] p-10 shadow-sm flex flex-col items-center gap-3 text-center">
              <p className="text-[#c9a84c] text-3xl">✦</p>
              <p className="text-[#1a1a2e] font-bold text-sm uppercase tracking-widest">
                Ask anything about travel
              </p>
              <p className="text-[#94a3b8] text-xs">
                Visa requirements, local customs, best time to visit, packing tips and more
              </p>
            </div>
          )}

        </div>
      </main>

      <footer className="border-t border-[#e2e8f0] bg-white p-4 text-center">
        <p className="text-[#94a3b8] text-xs uppercase tracking-widest">
          © 2026 KelanaAI — Built with FastAPI & Next.js
        </p>
      </footer>
    </div>
  );
}
