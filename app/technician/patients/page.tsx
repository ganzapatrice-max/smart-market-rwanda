"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function PatientsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  //////////////////////////////////////////////////////
  // LOAD PATIENTS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, "workers")); // ✅ FIXED

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      const patients = data.filter(
        (u) => u.role === "patient"
      );

      console.log("PATIENTS:", patients); // ✅ DEBUG

      setUsers(patients);
    };

    loadUsers();
  }, []);

  //////////////////////////////////////////////////////
  // SEARCH
  //////////////////////////////////////////////////////
  const filtered = users.filter((u) =>
    `${u.name || ""} ${u.location || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Find Patients
      </h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or location..."
        className="w-full bg-[#202c33] p-3 rounded-xl mb-5"
      />

      <div className="space-y-3">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href={`/patient/${user.id}`}
            className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl hover:bg-[#2a3942]"
          >
            <img
              src={user.photo || "https://i.pravatar.cc/150"}
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