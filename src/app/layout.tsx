import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Inter, Bebas_Neue } from "next/font/google";
import MotionRoot from "@/components/MotionRoot";

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
        <div className="navbar sticky top-0 z-30 border-b border-white/10 bg-base-100/70 backdrop-blur" data-motion="fade-down">
          <div className="navbar-start">
            <Link href="/" className="btn btn-ghost px-2 text-xl font-display motion-pressable">
              <span className="text-primary">C4os</span>&nbsp;Studio
            </Link>
          </div>
          <div className="navbar-center hidden md:flex">
            <ul className="menu menu-horizontal gap-1">
              <li><Link href="/" className="motion-pressable">Home</Link></li>
              <li><Link href="/book" className="motion-pressable">Prenota</Link></li>
              <li><Link href="/contact" className="motion-pressable">Contatti</Link></li>
              <li><Link href="/admin" className="motion-pressable">Admin</Link></li>
            </ul>
          </div>
          <div className="navbar-end gap-2">
            <Link href="/contact" className="btn btn-ghost btn-sm motion-pressable sm:btn-md">
              Contatti
            </Link>
            <a href="/book" className="btn btn-primary motion-pressable">Prenota ora</a>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <main className="min-h-[calc(100svh-140px)]">
          <MotionRoot>{children}</MotionRoot>
        </main>

        {/* FOOTER */}
        <footer className="mt-16 border-t border-white/10" data-motion="fade-up">
          <div className="container mx-auto max-w-6xl px-4 py-10 text-sm text-base-content/70" data-motion-stagger="90">
            <div className="flex flex-col items-center justify-between gap-3 md:flex-row" data-motion="fade-up">
              <div>© {new Date().getFullYear()} <span className="font-medium">C4os Studio</span></div>
              <div className="flex gap-4">
                <Link href="/book" className="link link-hover motion-pressable">Prenota</Link>
                <Link href="/contact" className="link link-hover motion-pressable">Contatti</Link>
                <Link href="/admin" className="link link-hover motion-pressable">Admin</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
