"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/",       label: "Trip My Plan" },
    { href: "/trips",  label: "Trip History" },
  ];

  return (
    <header className="w-full bg-[#0d2b1a] border-b-4 border-[#f5e642] font-mono">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-3 gap-2">

        {/* Logo */}
        <div className="text-center md:text-left">
          <h1 className="text-xl font-bold text-[#f5e642] uppercase tracking-widest">
            ► KelanaAI ◄
          </h1>
          <p className="text-[#52b788] text-xs tracking-widest uppercase">
            [ Plan your next adventure ]
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key       = {link.href}
                href      = {link.href}
                className = {`
                  px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition
                  ${isActive
                    ? "bg-[#f5e642] text-black border-[#f5e642]"
                    : "bg-transparent text-[#f5e642] border-[#f5e642] hover:bg-[#f5e642] hover:text-black"
                  }
                `}
              >
                ► {link.label}
              </Link>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
