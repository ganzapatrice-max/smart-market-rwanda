"use client";

import "./globals.css";
import Link from "next/link";
import { useState } from "react";

export const metadata = {
  title: "Smart Market Rwanda",
  description: "One place for everything",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <html lang="en">
      <body className="bg-[#f0f2f5] text-gray-900">

        {/* ================= NAVBAR ================= */}
        <header className="bg-blue-600 text-white shadow-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">

            {/* LEFT LOGO */}
            <h1 className="text-lg font-semibold">
              Smart Market Rwanda
            </h1>

            {/* CENTER NAV (DESKTOP) */}
            <nav className="hidden md:flex gap-6 text-xl">
              <Link href="/">🏠</Link>
              <Link href="/profile">👤</Link>
              <Link href="/services">🛠</Link>
              <Link href="/notifications">🔔</Link>
            </nav>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-3">

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden text-2xl"
              >
                ☰
              </button>

              {/* BADGE */}
              <div className="hidden md:block text-xs bg-blue-500 px-3 py-1 rounded-full">
                🇷🇼 Trusted
              </div>
            </div>

          </div>

          {/* ================= MOBILE DROPDOWN ================= */}
          {open && (
            <div className="md:hidden bg-blue-700 px-4 py-3 space-y-2 text-lg">

              <Link href="/" onClick={() => setOpen(false)}>🏠 Home</Link>
              <Link href="/profile" onClick={() => setOpen(false)}>👤 Profile</Link>
              <Link href="/services" onClick={() => setOpen(false)}>🛠 Services</Link>
              <Link href="/notifications" onClick={() => setOpen(false)}>🔔 Notifications</Link>

              <hr className="border-blue-400" />

              <Link href="/jobs" onClick={() => setOpen(false)}>💼 Jobs</Link>
              <Link href="/market" onClick={() => setOpen(false)}>🛒 Market</Link>
              <Link href="/messages" onClick={() => setOpen(false)}>💬 Messages</Link>
              <Link href="/settings" onClick={() => setOpen(false)}>⚙️ Settings</Link>
            </div>
          )}
        </header>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="max-w-6xl mx-auto flex gap-6 px-4 py-6">

          {/* ===== LEFT SIDEBAR (DESKTOP ONLY) ===== */}
          <aside className="hidden md:block w-1/4">
            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <p className="font-semibold mb-2">Menu</p>

              <div className="flex flex-col gap-2 text-sm">
                <Link href="/jobs">💼 Jobs</Link>
                <Link href="/market">🛒 Market</Link>
                <Link href="/messages">💬 Messages</Link>
                <Link href="/settings">⚙️ Settings</Link>
              </div>
            </div>
          </aside>

          {/* ===== CENTER ===== */}
          <main className="flex-1 max-w-2xl w-full">
            {children}
          </main>

          {/* ===== RIGHT PANEL ===== */}
          <aside className="hidden lg:block w-1/4">

            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <p className="font-semibold mb-2">Suggestions</p>
              <div className="text-sm text-gray-600">
                Follow users, explore services, and discover opportunities.
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold mb-2">Trending</p>
              <div className="text-sm text-gray-600">
                #SmartMarket <br />
                #RwandaBusiness <br />
                #Jobs <br />
                #Services
              </div>
            </div>

          </aside>
        </div>

      </body>
    </html>
  );
}