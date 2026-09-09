import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

// Inter — clean, highly readable, widely used in modern web apps
const inter = Inter({
  variable : "--font-inter",
  subsets  : ["latin"],
});

// Cinzel — kept for headings and logo only
const cinzel = Cinzel({
  variable : "--font-cinzel",
  subsets  : ["latin"],
  weight   : ["400", "700", "900"],
});

export const metadata: Metadata = {
  title       : "KelanaAI — Plan your next adventure",
  description : "AI-powered travel planner built with FastAPI and Next.js",
  icons       : {
    icon   : "/icon.svg",
    apple  : "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang      = "en"
      className = {`${inter.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body
        className = "min-h-full flex flex-col"
        style     = {{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
