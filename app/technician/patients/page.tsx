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
      const snap = await getDocs(collection(db, "users"));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      const patients = data.filter(
        (u) => u.role === "patient"
      );

      setUsers(patients);
    };

    loadUsers();
  }, []);

  //////////////////////////////////////////////////////
  // SEARCH (NAME ONLY)
  //////////////////////////////////////////////////////
  const filtered = users.filter((u) =>
    (u.name || "")
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

      {/* ✅ SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search patients..."
        className="w-full bg-[#202c33] p-3 rounded-xl mb-5"
      />

      {/* ✅ CLEAN LIST */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href={`/patient/${user.id}`} // ✅ FIXED
            className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl hover:bg-[#2a3942]"
          >
            {/* 👤 PHOTO */}
            <img
              src={user.photoURL || "https://i.pravatar.cc/150"}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />

            {/* 👤 NAME */}
            <div>
              <p className="font-semibold">
                {user.name || "No Name"}
              </p>
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