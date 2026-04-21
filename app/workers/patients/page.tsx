"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function PatientsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workers"), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const patients = data.filter(
        (item: any) => item.role === "patient"
      );

      setUsers(patients);
    });

    return () => unsub();
  }, []);

  const filtered = users.filter((item) =>
    `${item.name} ${item.location} ${item.service}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">
          Connect to Patient
        </h1>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by location..."
          className="w-full p-3 rounded-xl bg-[#202c33] mb-5 outline-none"
        />

        <div className="space-y-4">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-[#202c33] p-4 rounded-xl"
            >
              <p><b>Name:</b> {user.name}</p>
              <p><b>Phone:</b> {user.phone}</p>
              <p><b>Location:</b> {user.location}</p>
              <p><b>Status:</b> {user.online ? "Online" : "Offline"}</p>

              <Link
                href={`/chat/${encodeURIComponent(user.id)}`}
                className="block text-center mt-4 bg-blue-600 py-2 rounded-xl"
              >
                Chat with {user.name}
              </Link>
            </div>
          ))}
        </div>

        <Link
          href="/workers/profile"
          className="block text-center mt-6 bg-gray-700 py-3 rounded-xl"
        >
          Back to Profile
        </Link>

      </div>
    </main>
  );
}