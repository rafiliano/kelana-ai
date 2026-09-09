import { NavBar } from "@/components/NavBar";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <NavBar />

      <main className="flex-1 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-3xl flex flex-col gap-6">

          {/* Hero */}
          <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-md text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
              K
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">KelanaAI</h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              An AI-powered travel planning application that helps you plan your next adventure — from itineraries to visa requirements.
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: "✈️", title: "AI Trip Planning",       desc: "Generate full itineraries with morning, afternoon, and evening activities" },
                { icon: "💬", title: "Travel Chat",            desc: "Chat with an AI assistant about your travel plans and questions" },
                { icon: "🔍", title: "Ask the Knowledge Base", desc: "Get grounded answers about visa requirements, weather, and local tips" },
                { icon: "📋", title: "Trip History",           desc: "Save and revisit all your generated trip plans" },
                { icon: "🔐", title: "Secure Auth",            desc: "JWT-based authentication keeps your trips private" },
                { icon: "🌍", title: "Global Destinations",    desc: "Plan trips to any destination around the world" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-2xl p-3">
                  <span className="text-2xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Tech Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "FastAPI",    color: "bg-green-100 text-green-700"  },
                { name: "Next.js",    color: "bg-slate-100 text-slate-700"  },
                { name: "PostgreSQL", color: "bg-blue-100 text-blue-700"    },
                { name: "AWS Bedrock",color: "bg-orange-100 text-orange-700"},
                { name: "SQLAlchemy", color: "bg-purple-100 text-purple-700"},
                { name: "Tailwind",   color: "bg-cyan-100 text-cyan-700"    },
                { name: "JWT Auth",   color: "bg-yellow-100 text-yellow-700"},
                { name: "Neon DB",    color: "bg-teal-100 text-teal-700"    },
              ].map((t, i) => (
                <span key={i} className={`${t.color} rounded-full px-3 py-1.5 text-xs font-semibold text-center`}>
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          {/* Built by */}
          <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm text-center">
            <p className="text-slate-500 text-sm">Built by <span className="font-semibold text-slate-800">rafiliano</span> as part of Phase 2 coursework.</p>
            <div className="flex justify-center gap-4 mt-3">
              <a href="https://github.com/rafiliano/kelana-ai" target="_blank"
                className="text-blue-600 text-xs font-semibold hover:underline">
                GitHub Repository
              </a>
              <a href="http://localhost:8000/docs" target="_blank"
                className="text-blue-600 text-xs font-semibold hover:underline">
                API Documentation
              </a>
            </div>
          </div>

          <Link href="/"
            className="bg-blue-600 text-white font-semibold py-3 rounded-2xl text-sm text-center hover:bg-blue-700 transition">
            Start Planning →
          </Link>

        </div>
      </main>

      <footer className="border-t border-blue-100 bg-white p-4 text-center">
        <p className="text-slate-400 text-xs">© 2026 KelanaAI — Built with FastAPI & Next.js</p>
      </footer>
    </div>
  );
}
