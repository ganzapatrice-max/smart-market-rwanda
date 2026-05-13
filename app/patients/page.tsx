"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function PatientsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "users"));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      setUsers(data.filter((u) => u.role === "patient"));
    };

    load();
  }, []);

  const filtered = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-white p-4">
      
      <h1 className="text-xl font-bold mb-4">
        Patients List ✅
      </h1>

      {/* ✅ SEARCH BAR */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search patient..."
        className="w-full p-3 rounded bg-gray-800 mb-4"
      />

      {/* ✅ SIMPLE LIST */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href={`/patient/${user.id}`}
            className="flex items-center gap-3 bg-gray-900 p-3 rounded"
          >
            <img
              src={user.photoURL || "https://i.pravatar.cc/150"}
              className="w-12 h-12 rounded-full"
            />

            <div>
              <p>{user.name || "No Name"}</p>
              <p className="text-sm text-gray-400">
                View profile →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}