"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

type UserData = {
  id: string;
  name?: string;
  role?: string;
  photoURL?: string;
};

export default function PatientsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
        (user) => user.role === "patient"
      );

      setUsers(patients);
      setLoading(false);
    };

    loadUsers();
  }, []);

  //////////////////////////////////////////////////////
  // SEARCH
  //////////////////////////////////////////////////////
  const filtered = users.filter((user) =>
    (user.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  if (loading) {
    return (
      <main className="min-h-screen bg-[#111b21] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Find Patients
      </h1>

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
            href={`/patient/${user.id}`} // 👈 profile page
            className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl hover:bg-[#2a3942]"
          >
            {/* 👤 PHOTO */}
            <img
              src={user.photoURL || "/default-avatar.png"}
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