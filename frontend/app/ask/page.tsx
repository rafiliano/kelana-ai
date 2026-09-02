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

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <NavBar />

      <main className="flex-1 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-3xl flex flex-col gap-6">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">
              Ask the Travel AI
            </h2>
            <p className="text-slate-500 text-sm mt-2">Powered by your Knowledge Base</p>
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center gap-3 p-3">
            <span className="text-blue-500 text-lg flex-shrink-0">✦</span>
            <input
              value       = {question}
              onChange    = {(e) => setQuestion(e.target.value)}
              onKeyDown   = {(e) => e.key === "Enter" && handleAsk()}
              placeholder = "e.g. Do I need a visa to visit Japan?"
              className   = "flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-300 text-sm"
            />
            <button
              onClick   = {handleAsk}
              disabled  = {loading || !question.trim()}
              className = "bg-blue-600 text-white text-xs font-semibold rounded-full px-4 py-2 hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-500 text-sm">
              ⚠ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl border border-blue-100 p-8 flex flex-col items-center gap-4 shadow-sm">
              <div className="flex gap-2">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <p className="text-slate-400 text-sm">Searching knowledge base...</p>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="flex flex-col gap-4">

              {/* Question recap */}
              <div className="bg-blue-600 rounded-2xl px-5 py-4">
                <p className="text-xs text-blue-200 font-semibold mb-1">Your Question</p>
                <p className="text-white text-sm font-medium">{result.question}</p>
              </div>

              {/* No relevant answer */}
              {!result.answer ? (
                <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm text-center flex flex-col items-center gap-3">
                  <p className="text-green-500 text-3xl">✦</p>
                  <p className="text-slate-500 text-sm">{result.message}</p>
                  <span className="bg-slate-100 text-slate-500 text-xs rounded-full px-3 py-1">
                    Relevance: {(result.top_score * 100).toFixed(0)}%
                  </span>
                </div>
              ) : (
                <>
                  {/* Answer */}
                  <div className="bg-white rounded-2xl border border-blue-100 border-l-4 border-l-blue-500 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-50">
                      <p className="text-sm font-bold text-blue-600">
                        ✦ Answer
                      </p>
                      <span className="bg-green-100 text-green-700 text-xs font-semibold rounded-full px-3 py-1">
                        {(result.top_score * 100).toFixed(0)}% relevant
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none
                      prose-headings:text-slate-800 prose-headings:font-bold
                      prose-p:text-slate-600 prose-p:leading-relaxed
                      prose-li:text-slate-500 prose-li:marker:text-blue-400
                      prose-strong:text-slate-800">
                      <ReactMarkdown>{result.answer}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Sources */}
                  {result.sources && result.sources.length > 0 && (
                    <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                      <p className="text-xs text-slate-400 font-semibold mb-3 tracking-wider">
                        Sources Used
                      </p>
                      <div className="flex flex-col gap-2">
                        {result.sources.map((source: any, i: number) => (
                          <div key={i}
                            className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-2.5 text-sm">
                            <div className="flex items-center gap-2">
                              <span>📄</span>
                              <span className="text-slate-600 font-medium text-xs">{getFileName(source)}</span>
                            </div>
                            <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                              (source.score || 0) >= 0.8
                                ? "bg-green-100 text-green-700"
                                : (source.score || 0) >= 0.6
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-500"
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
            <div className="bg-white rounded-2xl border border-blue-100 p-10 shadow-sm flex flex-col items-center gap-3 text-center">
              <p className="text-green-500 text-3xl">✦</p>
              <p className="text-slate-700 font-semibold text-sm">Ask anything about travel</p>
              <p className="text-slate-400 text-xs">
                Visa requirements, local customs, best time to visit, packing tips and more
              </p>
            </div>
          )}

        </div>
      </main>

      <footer className="border-t border-blue-100 bg-white p-4 text-center mt-8">
        <p className="text-slate-400 text-xs">© 2026 KelanaAI — Built with FastAPI & Next.js</p>
      </footer>
    </div>
  );
}
