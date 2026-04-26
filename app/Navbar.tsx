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

          {/* ➕ POST */}
          <Link href="/post">➕ Create Post</Link>

          {/* 🔔 */}
          <Link href="/notifications" className="flex justify-between">
            <span>🔔 Notifications</span>
            {notifCount > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 rounded-full">
                {notifCount}
              </span>
            )}
          </Link>

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