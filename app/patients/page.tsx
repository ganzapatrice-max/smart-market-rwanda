"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

type Patient = {
  id: string;
  name?: string;
  role?: string;
  photo?: string;
  photoURL?: string;
  location?: string;
};

export default function PatientsPage() {
  const [users, setUsers] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  //////////////////////////////////////////////////////
  // LOAD PATIENTS (FROM WORKERS ✅)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "workers"));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));

        const patients = data.filter(
          (u) =>
            u.role?.toLowerCase().trim() === "patient"
        );

        console.log("PATIENTS:", patients); // 🔥 debug

        setUsers(patients);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  //////////////////////////////////////////////////////
  // SEARCH (NAME + LOCATION 🔥)
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
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <h1 className="text-xl font-bold mb-4">
        Patients List ✅
      </h1>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name or location..."
        className="w-full p-3 rounded bg-gray-800 mb-4"
      />

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <p className="text-gray-400 text-center mt-10">
          No patients found
        </p>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href={`/patient/${user.id}`}
            className="flex items-center gap-3 bg-gray-900 p-3 rounded"
          >
            <img
              src={
                user.photo ||
                user.photoURL ||
                "https://i.pravatar.cc/150"
              }
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
              <p>{user.name || "No Name"}</p>
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