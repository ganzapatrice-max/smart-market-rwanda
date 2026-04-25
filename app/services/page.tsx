"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import Link from "next/link";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});
  const [search, setSearch] = useState("");

  //////////////////////////////////////////////////////
  // LOAD SERVICES
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setServices(data);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD USERS (LINK PROFILE → SERVICES)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadUsers = async () => {
      const map: any = {};

      await Promise.all(
        services.map(async (s) => {
          if (!map[s.userId]) {
            const snap = await getDoc(doc(db, "users", s.userId));
            if (snap.exists()) {
              map[s.userId] = snap.data();
            }
          }
        })
      );

      setUsersMap(map);
    };

    if (services.length) loadUsers();
  }, [services]);

  //////////////////////////////////////////////////////
  // FILTER
  //////////////////////////////////////////////////////
  const filtered = services.filter((s) => {
    return (
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.toLowerCase().includes(search.toLowerCase())
    );
  });

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#f0f2f5]">

      {/* TOP NAV */}
      <div className="bg-blue-600 text-white flex justify-between px-6 py-3">
        <h1 className="font-bold">🛠 Services</h1>

        <div className="flex gap-4 text-sm">
          <Link href="/">🏠 Home</Link>
          <Link href="/profile">👤 Profile</Link>
          <Link href="/services/create">➕ Add Service</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-4">

        {/* SEARCH */}
        <input
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 p-3 rounded-full bg-white shadow"
        />

        {/* SERVICES LIST */}
        <div className="space-y-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow p-4">

              {/* HEADER */}
              <div className="flex items-center gap-3 mb-2">

                <img
                  src={
                    usersMap[s.userId]?.photo ||
                    "/default-avatar.png"
                  }
                  className="w-10 h-10 rounded-full"
                />

                <div>
                  <p className="font-semibold text-sm">
                    {usersMap[s.userId]?.name || "User"}
                  </p>

                  <Link
                    href={`/profile/${s.userId}`}
                    className="text-xs text-blue-500"
                  >
                    View profile
                  </Link>
                </div>
              </div>

              {/* CONTENT */}
              <h2 className="text-lg font-bold">{s.title}</h2>

              <p className="text-sm text-gray-700 mt-1">
                {s.description}
              </p>

              <p className="text-green-600 font-bold mt-2">
                {s.price} RWF
              </p>

              <p className="text-xs text-gray-500">
                📍 {s.location || "No location"}
              </p>

              <p className="text-xs text-gray-500">
                📂 {s.category || "General"}
              </p>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-3">

                <a
                  href={`tel:${s.phone}`}
                  className="bg-green-600 text-white px-4 py-1 rounded"
                >
                  📞 Call
                </a>

                <a
                  href={`https://wa.me/${s.phone}`}
                  target="_blank"
                  className="bg-green-500 text-white px-4 py-1 rounded"
                >
                  💬 WhatsApp
                </a>

                <Link
                  href={`/profile/${s.userId}`}
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                  View Seller
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No services found.
          </p>
        )}
      </div>
    </main>
  );
}