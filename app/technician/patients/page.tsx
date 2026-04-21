"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";

export default function PatientsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(
        collection(db, "users")
      );

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const patients = data.filter(
        (u: any) => u.role === "patient"
      );

      setUsers(patients);
    };

    loadUsers();
  }, []);

  const filtered = users.filter((u: any) =>
    `${u.name} ${u.location} ${u.service}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Find Patients
      </h1>

      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search patients..."
        className="w-full bg-[#202c33] p-3 rounded-xl mb-5"
      />

      <div className="space-y-4">
        {filtered.map((user: any) => (
          <Link
            key={user.id}
            href={`/chat/${user.name}`}
            className="block bg-[#202c33] p-4 rounded-xl"
          >
            <h2 className="font-bold">
              {user.name}
            </h2>

            <p className="text-sm text-gray-400">
              Needs {user.service} • {user.location}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}