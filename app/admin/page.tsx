"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminPage() {
  const router = useRouter();
  const [revenue, setRevenue] = useState(0);

  //////////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////////
  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  //////////////////////////////////////////////////////
  // LOAD REVENUE
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadRevenue = async () => {
      try {
        const snap = await getDoc(
          doc(db, "platform", "main")
        );

        if (snap.exists()) {
          setRevenue(
            snap.data().totalRevenue || 0
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadRevenue();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">
            👑 Admin Dashboard
          </h1>

          <p className="text-gray-400 mt-2">
            Full control panel
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 px-5 py-3 rounded-2xl font-bold hover:bg-red-700"
        >
          🚪 Logout
        </button>
      </div>

      {/* REVENUE */}
      <div className="bg-green-600 rounded-3xl p-6 mb-8 shadow-xl">
        <p className="text-lg">
          Platform Revenue
        </p>

        <h2 className="text-4xl font-bold mt-2">
          {revenue} Frw
        </h2>
      </div>

      {/* MENU */}
      <div className="grid gap-6 md:grid-cols-2">

        <Link
          href="/admin/users"
          className="bg-indigo-600 rounded-3xl p-6 font-bold hover:scale-105 duration-200"
        >
          👤 Users Panel
        </Link>

        <Link
          href="/admin/withdrawals"
          className="bg-pink-600 rounded-3xl p-6 font-bold hover:scale-105 duration-200"
        >
          💸 Withdrawals
        </Link>

        <Link
          href="/admin/chats"
          className="bg-cyan-600 rounded-3xl p-6 font-bold hover:scale-105 duration-200"
        >
          💬 Chat Tracking
        </Link>

        <Link
          href="/admin/ads"
          className="bg-yellow-500 text-black rounded-3xl p-6 font-bold hover:scale-105 duration-200"
        >
          📢 Ads Panel
        </Link>

        <Link
          href="/"
          className="bg-green-700 rounded-3xl p-6 font-bold hover:scale-105 duration-200"
        >
          🚀 Open Platform
        </Link>

      </div>

      {/* FOOTER */}
      <div className="text-center text-gray-500 mt-10">
        Smart Market Rwanda Admin
      </div>

    </main>
  );
}