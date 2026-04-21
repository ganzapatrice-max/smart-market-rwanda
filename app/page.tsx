"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return;

      const data = snap.data();

      if (data.role === "admin") router.push("/admin");
      if (data.role === "technician") router.push("/technician");
    });

    return () => unsub();
  }, [router]);

  const categories = [
    { icon: "🔧", title: "Find Workers", desc: "Tutors, cleaners, plumbers", link: "/workers" },
    { icon: "🏠", title: "Rent Houses", desc: "Homes, apartments, rooms", link: "/rent" },
    { icon: "📱", title: "Buy Used Products", desc: "Phones, laptops, furniture", link: "/used" },
    { icon: "📢", title: "Promote Business", desc: "Advertise your business", link: "/marketing" },
    { icon: "💼", title: "Jobs", desc: "Find jobs and workers", link: "/jobs" },
    { icon: "🚗", title: "Cars", desc: "Buy, sell or rent cars", link: "/cars" },
  ];

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Smart Market Rwanda
        </h1>

        {/* BUTTONS */}
        <div className="flex gap-3 flex-wrap">

          <Link
            href="/login"
            className="bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold"
          >
            Login
          </Link>

          <Link
            href="/withdraw"
            className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-semibold"
          >
            Withdraw
          </Link>

          <Link
            href="/signup"
            className="bg-green-500 px-4 py-2 rounded-xl font-semibold"
          >
            Signup
          </Link>

          <Link
            href="/admin"
            className="bg-black px-4 py-2 rounded-xl font-semibold"
          >
            Admin
          </Link>

        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">

        <p className="text-center text-gray-600 text-xl mb-10">
          One place for everything
        </p>

        <div className="max-w-3xl mx-auto space-y-9">
          {categories.map((item, index) => (
            <Link key={index} href={item.link}>
              <div className="bg-white rounded-2xl shadow hover:shadow-xl p-5 flex items-center gap-5 cursor-pointer hover:bg-blue-50 transition">

                <div className="text-3xl">
                  {item.icon}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-black">
                    {item.title}
                  </h2>

                  <p className="text-gray-600">
                    {item.desc}
                  </p>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}