"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn, getUserName, removeToken } from "@/services/authService";

export function NavBar() {
  const pathname          = usePathname();
  const router            = useRouter();
  const [loggedIn, setLoggedIn]       = useState(false);
  const [userName, setUserName]       = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Read auth state from localStorage on mount
  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUserName(getUserName());
    setDropdownOpen(false); // close dropdown on page change
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown]")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    removeToken();
    setLoggedIn(false);
    setUserName(null);
    router.push("/login");
  };

  const navLinks = [
    { href: "/",      label: "Trip My Plan" },
    { href: "/trips", label: "Trip History" },
    { href: "/ask",   label: "Ask AI"       },
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

        {/* Right side — nav + auth */}
        <div className="flex items-center gap-3 flex-wrap justify-center">

          {/* Nav links — only show when logged in */}
          {loggedIn && (
            <nav className="flex gap-2">
              {navLinks.map((link) => {
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
          )}

          {/* Auth section */}
          {loggedIn ? (
            <div className="relative" data-dropdown>
              {/* Avatar button */}
              <button
                onClick   = {() => setDropdownOpen(o => !o)}
                className = "flex items-center gap-2 px-3 py-2 border border-[#e2e8f0] hover:border-[#c0392b] transition"
              >
                <div className="w-7 h-7 bg-[#c0392b] text-white flex items-center justify-center text-xs font-bold uppercase">
                  {userName ? userName[0] : "U"}
                </div>
                <span className="text-xs text-[#475569] uppercase tracking-widest hidden md:block">
                  {userName}
                </span>
                <span className="text-[#94a3b8] text-xs">{dropdownOpen ? "▲" : "▼"}</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#e2e8f0] shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-[#e2e8f0]">
                    <p className="text-xs font-bold text-[#1a1a2e] uppercase tracking-widest">{userName}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">Logged in</p>
                  </div>
                  <Link
                    href      = "/profile"
                    className = "block w-full text-left px-4 py-3 text-xs text-[#475569] font-bold uppercase tracking-widest hover:bg-[#f8faf9] transition border-b border-[#e2e8f0]"
                    onClick   = {() => setDropdownOpen(false)}
                  >
                    👤 Profile
                  </Link>
                  <button
                    onClick   = {handleLogout}
                    className = "w-full text-left px-4 py-3 text-xs text-[#c0392b] font-bold uppercase tracking-widest hover:bg-[#fdf2f2] transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href      = "/login"
                className = "px-4 py-2 text-xs font-bold uppercase tracking-widest border border-[#c0392b] text-[#c0392b] hover:bg-[#c0392b] hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href      = "/register"
                className = "px-4 py-2 text-xs font-bold uppercase tracking-widest bg-[#c0392b] text-white hover:bg-[#a93226] transition"
              >
                Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
