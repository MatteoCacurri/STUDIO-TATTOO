import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Inter, Bebas_Neue } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });

export const metadata: Metadata = {
  title: "Studio Tattoo",
  description: "Prenota il tuo prossimo tatuaggio. Gestione richieste, calendario e pannello admin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-theme="studio" className="min-h-full">
      <body className={`${inter.variable} ${bebas.variable} bg-base-100 text-base-content bg-hero-soft`}>
        {/* NAVBAR */}
        <div className="navbar sticky top-0 z-30 bg-base-100/70 backdrop-blur border-b border-white/10">
          <div className="navbar-start">
            <Link href="/" className="btn btn-ghost px-2 text-xl font-display">
              <span className="text-primary">C4os</span>&nbsp;Studio
            </Link>
          </div>
          <div className="navbar-center hidden md:flex">
            <ul className="menu menu-horizontal gap-1">
              <li><Link href="/" className="hover-float">Home</Link></li>
              <li><Link href="/book" className="hover-float">Prenota</Link></li>
              <li><Link href="/admin" className="hover-float">Admin</Link></li>
            </ul>
          </div>
          <div className="navbar-end">
            <a href="/book" className="btn btn-primary hover-float">Prenota ora</a>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <main className="min-h-[calc(100svh-140px)]">{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-white/10 mt-16">
          <div className="container mx-auto max-w-6xl px-4 py-10 text-sm text-base-content/70">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div>© {new Date().getFullYear()} <span className="font-medium">C4os Studio</span></div>
              <div className="flex gap-4">
                <Link href="/book" className="link link-hover">Prenota</Link>
                <Link href="/admin" className="link link-hover">Admin</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
