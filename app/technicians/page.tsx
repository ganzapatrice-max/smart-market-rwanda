"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

type Technician = {
  id: string;
  name?: string;
  role?: string;
  photo?: string;
  location?: string;
};

export default function TechniciansPage() {
  const [users, setUsers] = useState<Technician[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "workers")); // ✅ FIXED

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      const technicians = data.filter(
        (u) => u.role === "technician"
      );

      setUsers(technicians);
    };

    load();
  }, []);

  const filtered = users.filter((u) =>
    `${u.name || ""} ${u.location || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Find Technicians
      </h1>

      {/* ✅ SEARCH BAR */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or location..."
        className="w-full bg-[#202c33] p-3 rounded-xl mb-5"
      />

      {/* ✅ LIST */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href={`/technician/${user.id}`}
            className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl"
          >
            <img
              src={user.photo || "/default-avatar.png"}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
              <p className="font-semibold">
                {user.name || "No Name"}
              </p>
              <p className="text-sm text-gray-400">
                {user.location || "No location"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}