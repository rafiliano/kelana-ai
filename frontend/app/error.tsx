"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-8 text-center">
      <p className="text-8xl font-black text-blue-200 mb-4">500</p>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h1>
      <p className="text-slate-500 text-sm mb-8 max-w-sm">
        An unexpected error occurred. Please try again or go back home.
      </p>
      <div className="flex gap-3">
        <button
          onClick   = {reset}
          className = "bg-blue-600 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-blue-700 transition"
        >
          Try Again
        </button>
        <Link
          href      = "/"
          className = "border border-blue-300 text-blue-600 font-semibold px-6 py-3 rounded-full text-sm hover:bg-blue-50 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
