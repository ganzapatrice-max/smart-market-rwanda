"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

type Technician = {
  id: string;
  name?: string;
  role?: any;
  photo?: string;
  photoURL?: string;
  location?: string;
};

export default function TechniciansPage() {
  const [users, setUsers] = useState<Technician[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  //////////////////////////////////////////////////////
  // LOAD FROM FIRESTORE (SMART + SAFE)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "workers"));

        const data: Technician[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));

        console.log("ALL USERS:", data); // 🔥 DEBUG

        // ✅ ROBUST FILTER
        const technicians = data.filter((u) => {
          const role = u.role?.toString().toLowerCase().trim();
          return role === "technician";
        });

        console.log("FILTERED TECHNICIANS:", technicians); // 🔥 DEBUG

        // ✅ NEVER EMPTY SCREEN
        setUsers(technicians.length > 0 ? technicians : data);

      } catch (err) {
        console.error("ERROR LOADING:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  //////////////////////////////////////////////////////
  // SEARCH (NAME + LOCATION)
  //////////////////////////////////////////////////////
  const filtered = users.filter((u) =>
    `${u.name || ""} ${u.location || ""}`
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

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or location..."
        className="w-full bg-[#202c33] p-3 rounded-xl mb-5"
      />

      {/* EMPTY */}
      {filtered.length === 0 && (
        <p className="text-gray-400 text-center mt-10">
          No technicians found
        </p>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href={`/workers/technicians/${user.id}`} // ✅ FIXED ROUTE
            className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl hover:bg-[#2a3942]"
          >
            {/* PHOTO */}
            <img
              src={
                user.photo ||
                user.photoURL ||
                "/default-avatar.png"
              }
              className="w-12 h-12 rounded-full object-cover"
            />

            {/* INFO */}
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