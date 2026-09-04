"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn, getUserName, removeToken } from "@/services/authService";

export function NavBar() {
  const pathname              = usePathname();
  const router                = useRouter();
  const [loggedIn, setLoggedIn]         = useState(false);
  const [userName, setUserName]         = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUserName(getUserName());
    setDropdownOpen(false);
  }, [pathname]);

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
    { href: "/",      label: "Plan Trip" },
    { href: "/trips", label: "My Trips"  },
    { href: "/chat",  label: "Chat"      },
    { href: "/ask",   label: "Ask AI"    },
  ];

  return (
    <header className="w-full bg-white border-b border-blue-100 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 gap-4">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <h1 className="text-lg font-black text-blue-600 tracking-wide">
            KelanaAI
          </h1>
          <p className="text-green-600 text-xs hidden md:block">
            Plan your next adventure
          </p>
        </Link>

        {/* Nav links — only when logged in */}
        {loggedIn && (
          <nav className="flex gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key       = {link.href}
                  href      = {link.href}
                  className = {`
                    px-4 py-2 text-xs font-semibold rounded-full transition
                    ${isActive
                      ? "bg-blue-600 text-white"
                      : "text-blue-600 hover:bg-blue-50"
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
          <div className="relative flex-shrink-0" data-dropdown>
            <button
              onClick   = {() => setDropdownOpen(o => !o)}
              className = "flex items-center gap-2 px-3 py-2 rounded-full border border-blue-100 hover:border-blue-300 transition"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {userName ? userName[0] : "U"}
              </div>
              <span className="text-xs text-slate-600 font-medium hidden md:block">
                {userName}
              </span>
              <span className="text-slate-400 text-xs">{dropdownOpen ? "▲" : "▼"}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-blue-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-blue-50">
                  <p className="text-xs font-bold text-slate-800">{userName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Logged in</p>
                </div>
                <Link
                  href      = "/profile"
                  className = "flex items-center gap-2 w-full px-4 py-3 text-xs text-slate-600 font-medium hover:bg-blue-50 transition border-b border-blue-50"
                  onClick   = {() => setDropdownOpen(false)}
                >
                  👤 Profile
                </Link>
                <button
                  onClick   = {handleLogout}
                  className = "flex items-center gap-2 w-full px-4 py-3 text-xs text-red-500 font-medium hover:bg-red-50 transition"
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href      = "/login"
              className = "px-4 py-2 text-xs font-semibold rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
            >
              Sign In
            </Link>
            <Link
              href      = "/register"
              className = "px-4 py-2 text-xs font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Register
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}
