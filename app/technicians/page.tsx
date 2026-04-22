"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
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
            setMyEmail(user.email);
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
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

    if (myEmail) {
      loadUsers();
    }
  }, [myEmail]);

  //////////////////////////////////////////////////////
  // BOOK TECHNICIAN
  //////////////////////////////////////////////////////
  const bookNow = async (
    tech: Technician
  ) => {
    const user =
      auth.currentUser;

    if (!user) {
      alert(
        "Login first"
      );
      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "jobs"
        ),
        {
          customerId:
            user.uid,
          customerName:
            user.displayName ||
            "Customer",

          technicianId:
            tech.id,
          technicianName:
            tech.name ||
            "Technician",

          service:
            tech.service ||
            "Service",

          location:
            tech.location ||
            "",

          price: 10000,

          status:
            "pending",

          createdAt:
            serverTimestamp(),
        }
      );

      alert(
        "Booking sent successfully"
      );
    } catch (error) {
      alert(
        "Failed to book"
      );
    }
  };

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
          {filtered.map(
            (user) => (
              <div
                key={
                  user.id
                }
                className="bg-[#202c33] p-4 rounded-xl"
              >
                <h2 className="font-bold text-lg">
                  {user.name ||
                    "No Name"}
                </h2>

                <p className="text-sm text-gray-400 mb-3">
                  {user.service ||
                    "No Skill"}{" "}
                  •{" "}
                  {user.location ||
                    "No Location"}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/chat/${encodeURIComponent(
                      user.id
                    )}`}
                    className="bg-blue-600 text-center p-3 rounded-xl font-bold"
                  >
                    Chat
                  </Link>

                  <button
                    onClick={() =>
                      bookNow(
                        user
                      )
                    }
                    className="bg-green-600 p-3 rounded-xl font-bold"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}