"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";

type UserData = {
  id: string;
  name: string;
  location: string;
  service: string;
  role: string;
};

export default function PatientsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(
        collection(db, "users")
      );

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<UserData, "id">),
      }));

      const patients = data.filter(
        (user) => user.role === "patient"
      );

      setUsers(patients);
    };

    loadUsers();
  }, []);

  const filtered = users.filter((user) =>
    `${user.name} ${user.location} ${user.service}`
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
        className="w-full bg-[#202c33] p-3 rounded-xl mb-5 outline-none"
      />

      <div className="space-y-4">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href="/chat/general"
            className="block bg-[#202c33] p-4 rounded-xl hover:bg-[#2a3942]"
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