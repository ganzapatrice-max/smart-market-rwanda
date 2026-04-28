"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [popup, setPopup] = useState<string | null>(null);

  //////////////////////////////////////////////////////
  // 🔊 SOUND
  //////////////////////////////////////////////////////
  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  //////////////////////////////////////////////////////
  // 🔔 REALTIME NOTIFICATIONS
  //////////////////////////////////////////////////////
  useEffect(() => {
    let unsub: any;

    const authUnsub = auth.onAuthStateChanged((u) => {
      if (!u) return;

      const q = query(
        collection(db, "notifications"),
        where("toUserId", "==", u.uid),
        where("read", "==", false)
      );

      unsub = onSnapshot(q, (snap) => {
        // 🔊 play sound when new notification comes
        if (snap.size > notifCount) {
          playSound();
          setPopup("🔔 New notification");

          setTimeout(() => setPopup(null), 3000);
        }

        setNotifCount(snap.size);
      });
    });

    return () => {
      authUnsub();
      if (unsub) unsub();
    };
  }, [notifCount]);

  return (
    <header className="bg-blue-600 text-white sticky top-0 z-50">

      {/* 💬 POPUP */}
      {popup && (
        <div className="fixed top-16 right-4 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
          {popup}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-2 flex justify-between items-center">

        <h1 className="font-semibold">Smart Market Rwanda</h1>
        <Link
  href="/messages"
  className="relative"
>
  💬
</Link>

        {/* DESKTOP */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/">🏠</Link>
          <Link href="/profile">👤</Link>
          <Link href="/services">🛠</Link>
          <Link href="/orders">💼</Link>

          {/* ➕ POST BUTTON */}
          <Link
            href="/post"
            className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold"
          >
            + Post
          </Link>

          {/* 🔔 */}
          <Link href="/notifications" className="relative">
            🔔
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
                {notifCount}
              </span>
            )}
          </Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button
  onClick={() => setOpen(!open)}
  className="md:hidden text-2xl focus:outline-none"
>
  ☰
</button>
      </div>

  {/* MOBILE MENU */}
{open && (
  <div className="fixed inset-0 z-40">

    {/* DARK OVERLAY */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setOpen(false)}
    />

    {/* SIDE MENU */}
    <div className="absolute top-0 left-0 h-full w-3/4 bg-blue-700 p-5 space-y-4 shadow-lg">

      <h2 className="text-lg font-bold mb-3">Menu</h2>

      <Link onClick={() => setOpen(false)} href="/" className="block py-2 border-b border-blue-500">
        🏠 Home
      </Link>

      <Link onClick={() => setOpen(false)} href="/profile" className="block py-2 border-b border-blue-500">
        👤 Profile
      </Link>

      <Link onClick={() => setOpen(false)} href="/services" className="block py-2 border-b border-blue-500">
        🛠 Services
      </Link>

      <Link onClick={() => setOpen(false)} href="/post" className="block py-2 border-b border-blue-500">
        ➕ Create Post
      </Link>

      <Link onClick={() => setOpen(false)} href="/orders" className="block py-2 border-b border-blue-500">
        💼 Orders
      </Link>

      <Link onClick={() => setOpen(false)} href="/notifications" className="flex justify-between py-2 border-b border-blue-500">
        <span>🔔 Notifications</span>
        {notifCount > 0 && (
          <span className="bg-red-600 text-white text-xs px-2 rounded-full">
            {notifCount}
          </span>
        )}
      </Link>

      <Link onClick={() => setOpen(false)} href="/messages" className="block py-2 border-b border-blue-500">
        💬 Messages
      </Link>

      <Link onClick={() => setOpen(false)} href="/jobs" className="block py-2 border-b border-blue-500">
        💼 Jobs
      </Link>

      <Link onClick={() => setOpen(false)} href="/market" className="block py-2 border-b border-blue-500">
        🛒 Market
      </Link>

      <Link onClick={() => setOpen(false)} href="/settings" className="block py-2">
        ⚙️ Settings
      </Link>
    </div>
  </div>
)}
    </header>
  );
}