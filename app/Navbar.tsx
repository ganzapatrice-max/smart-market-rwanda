"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-blue-600 text-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-2 flex justify-between items-center">

        <h1 className="font-semibold">Smart Market Rwanda</h1>

        {/* DESKTOP */}
        <nav className="hidden md:flex gap-6">
          <Link href="/">🏠</Link>
          <Link href="/profile">👤</Link>
          <Link href="/services">🛠</Link>
          <Link href="/notifications">🔔</Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-blue-700 px-4 py-3 space-y-2">
          <Link href="/">🏠 Home</Link>
          <Link href="/profile">👤 Profile</Link>
          <Link href="/services">🛠 Services</Link>
          <Link href="/notifications">🔔 Notifications</Link>

          <hr />

          <Link href="/jobs">💼 Jobs</Link>
          <Link href="/market">🛒 Market</Link>
          <Link href="/messages">💬 Messages</Link>
          <Link href="/settings">⚙️ Settings</Link>
        </div>
      )}
    </header>
  );
}