"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/",      label: "Trip My Plan" },
    { href: "/trips", label: "Trip History" },
  ];

  return (
    <header className="w-full bg-white border-b-2 border-[#c0392b] shadow-sm">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-3 gap-2">

        {/* Logo */}
        <div className="text-center md:text-left">
          <h1 className="text-xl font-bold text-[#c9a84c] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-cinzel)" }}>
            ✦ KelanaAI ✦
          </h1>
          <p className="text-[#c0392b] text-xs tracking-widest uppercase">
            Plan your next adventure
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key       = {link.href}
                href      = {link.href}
                className = {`
                  px-4 py-2 text-xs font-bold uppercase tracking-widest border transition
                  ${isActive
                    ? "bg-[#c0392b] text-white border-[#c0392b]"
                    : "bg-transparent text-[#c0392b] border-[#c0392b] hover:bg-[#c0392b] hover:text-white"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
