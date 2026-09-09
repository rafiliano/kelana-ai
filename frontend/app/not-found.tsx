import Link from "next/link";
import { NavBar } from "@/components/NavBar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-8xl font-black text-blue-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Page not found</h1>
        <p className="text-slate-500 text-sm mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </main>
    </div>
  );
}
