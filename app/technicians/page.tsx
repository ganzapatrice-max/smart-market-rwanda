"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import Link from "next/link";

type Technician = {
  id: string;
  name?: string;
  email?: string;
  location?: string;
  service?: string;
  role?: string;
};

export default function TechniciansPage() {
  const [users, setUsers] =
    useState<Technician[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [myEmail, setMyEmail] =
    useState("");

  //////////////////////////////////////////////////////
  // GET CURRENT USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub =
      onAuthStateChanged(
        auth,
        (user) => {
          if (user?.email) {
            setMyEmail(
              user.email
            );
          }
        }
      );

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD TECHNICIANS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadUsers =
      async () => {
        try {
          const snap =
            await getDocs(
              collection(
                db,
                "users"
              )
            );

          const data: Technician[] =
            snap.docs.map(
              (doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<
                  Technician,
                  "id"
                >),
              })
            );

          const technicians =
            data.filter(
              (user) =>
                user.role ===
                  "technician" &&
                user.email !==
                  myEmail
            );

          setUsers(
            technicians
          );
        } catch (error) {
          console.log(
            error
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    if (myEmail) {
      loadUsers();
    }
  }, [myEmail]);

  //////////////////////////////////////////////////////
  // SEARCH
  //////////////////////////////////////////////////////
  const filtered =
    users.filter(
      (user) =>
        `${user.name || ""} ${
          user.location || ""
        } ${
          user.service || ""
        }`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  //////////////////////////////////////////////////////
  // LOADING
  //////////////////////////////////////////////////////
  if (loading) {
    return (
      <main className="min-h-screen bg-[#111b21] text-white flex justify-center items-center">
        Loading...
      </main>
    );
  }

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Find Technicians
      </h1>

      <input
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        placeholder="Search technicians..."
        className="w-full bg-[#202c33] p-3 rounded-xl mb-5 outline-none"
      />

      {filtered.length ===
      0 ? (
        <div className="text-center text-gray-400 mt-10">
          No technicians found
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((user) => (
  <Link
    key={user.id}
    href={`/chat/${encodeURIComponent(user.id)}`}
    className="block bg-[#202c33] p-4 rounded-xl hover:bg-[#2a3942]"
  >
    <h2 className="font-bold text-lg">
      {user.name || "No Name"}
    </h2>

    <p className="text-sm text-gray-400">
      {user.service || "No Skill"} • {user.location || "No Location"}
    </p>
  </Link>
))}
        </div>
      )}
    </main>
  );
}