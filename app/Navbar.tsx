"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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

  const prevCount = useRef(0); // ✅ FIX: track previous count

  //////////////////////////////////////////////////////
  // 🔊 SOUND
  //////////////////////////////////////////////////////
  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  //////////////////////////////////////////////////////
  // 🔔 REALTIME NOTIFICATIONS (FIXED)
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
        const newCount = snap.size;

        // ✅ FIX: compare with previous count (NOT state dependency)
        if (newCount > prevCount.current) {
          playSound();
          setPopup("🔔 New notification");

          setTimeout(() => setPopup(null), 3000);
        }

        prevCount.current = newCount;
        setNotifCount(newCount);
      });
    });

    return () => {
      authUnsub();
      if (unsub) unsub();
    };
  }, []);

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <header className="bg-blue-600 text-white sticky top-0 z-50">

      {/* POPUP */}
      {popup && (
        <div className="fixed top-16 right-4 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
          {popup}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-2 flex justify-between items-center">

        <h1 className="font-semibold">Smart Market</h1>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-4">

          {/* 💬 Messages */}
          <Link href="/messages">💬</Link>

          {/* 🔔 Notifications */}
          <Link href="/notifications" className="relative">
            🔔
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
                {notifCount}
              </span>
            )}
          </Link>

          {/* ☰ Mobile */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </div>

        {/* DESKTOP */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/">🏠</Link>
          <Link href="/profile">👤</Link>
          <Link href="/services">🛠</Link>
          <Link href="/orders">💼</Link>

          <Link
            href="/post"
            className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold"
          >
            + Post
          </Link>
        </nav>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="fixed inset-0 z-40">

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* drawer */}
          <div className="absolute top-0 left-0 h-full w-3/4 bg-blue-700 p-5 space-y-4">

            <h2 className="text-lg font-bold">Menu</h2>

            <Link onClick={() => setOpen(false)} href="/">🏠 Home</Link>
            <Link onClick={() => setOpen(false)} href="/profile">👤 Profile</Link>
            <Link onClick={() => setOpen(false)} href="/services">🛠 Services</Link>
            <Link onClick={() => setOpen(false)} href="/post">➕ Post</Link>
            <Link onClick={() => setOpen(false)} href="/orders">💼 Orders</Link>

            <Link onClick={() => setOpen(false)} href="/notifications" className="flex justify-between">
              <span>🔔 Notifications</span>
              {notifCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 rounded-full">
                  {notifCount}
                </span>
              )}
            </Link>

            <Link onClick={() => setOpen(false)} href="/messages">💬 Messages</Link>
          </div>
        </div>
      )}
    </header>
  );
}