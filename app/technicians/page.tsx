"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

type Technician = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  photoURL?: string;
};

export default function TechniciansPage() {
  const [users, setUsers] = useState<Technician[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [myEmail, setMyEmail] = useState("");

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.email) setMyEmail(user.email);
    });
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD TECHNICIANS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "users"));

      const data: Technician[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      const technicians = data.filter(
        (u) => u.role === "technician" && u.email !== myEmail
      );

      setUsers(technicians);
      setLoading(false);
    };

    if (myEmail) load();
  }, [myEmail]);

  //////////////////////////////////////////////////////
  // SEARCH
  //////////////////////////////////////////////////////
  const filtered = users.filter((u) =>
    (u.name || "")
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
        Find Technicians
      </h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search technicians..."
        className="w-full bg-[#202c33] p-3 rounded-xl mb-5"
      />

      {/* ✅ CLEAN LIST LIKE WHATSAPP */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href={`/technician/${user.id}`}
            className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl"
          >
            {/* 👤 PROFILE PHOTO */}
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