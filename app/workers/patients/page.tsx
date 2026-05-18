"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

type Patient = {
  id: string;
  name?: string;
  phone?: string;
  location?: string;
  photo?: string;
  online?: boolean;
  bio?: string;
};

export default function PatientsPage() {
  const [users, setUsers] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");

  //////////////////////////////////////////////////////
  // LOAD PATIENTS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workers"), (snap) => {
      const data: Patient[] = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }))
        .filter((item: any) => item.role === "patient");

      setUsers(data);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // SEARCH
  //////////////////////////////////////////////////////
  const filtered = users.filter((item) =>
    `${item.name || ""} ${item.location || ""} ${item.bio || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Connect to Patient
      </h1>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search patient..."
        className="w-full p-3 rounded-xl bg-[#202c33] mb-5"
      />

      {/* EMPTY */}
      {filtered.length === 0 && (
        <p className="text-gray-400 text-center">
          No patients found
        </p>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href={`/workers/patients/${user.id}`} // ✅ IMPORTANT
            className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl hover:bg-[#2a3942]"
          >
            {/* PHOTO */}
            <img
              src={user.photo || "/default-avatar.png"}
              className="w-12 h-12 rounded-full object-cover"
            />

            {/* INFO */}
            <div className="flex-1">
              <p className="font-semibold">
                {user.name || "No Name"}
              </p>

              <p className="text-sm text-gray-400">
                {user.location || "No location"}
              </p>

              <p className="text-xs text-gray-500">
                {user.bio || "No description"}
              </p>
            </div>

            {/* STATUS */}
            <span
              className={`text-xs ${
                user.online
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              {user.online ? "● Online" : "● Offline"}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}