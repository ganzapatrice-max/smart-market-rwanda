"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

import { getDistance, estimateTime } from "@/lib/location";

type Technician = {
  id: string;
  name?: string;
  email?: string;
  service?: string;
  role?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  distance?: number;
};

export default function TechniciansPage() {
  const [users, setUsers] = useState<Technician[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [myEmail, setMyEmail] = useState("");
  const [myLocation, setMyLocation] = useState<any>(null);

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
  // GPS
  //////////////////////////////////////////////////////
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setMyLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  //////////////////////////////////////////////////////
  // LOAD USERS
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
  // BOOK
  //////////////////////////////////////////////////////
  const bookNow = async (tech: Technician) => {
    const user = auth.currentUser;
    if (!user) return alert("Login first");

    await addDoc(collection(db, "jobs"), {
      customerId: user.uid,
      technicianId: tech.id,
      technicianName: tech.name || "Technician",
      service: tech.service || "Service",
      location: tech.location?.address || "",
      price: 10000,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    alert("Booking sent ✅");
  };

  //////////////////////////////////////////////////////
  // FILTER + SORT 🔥
  //////////////////////////////////////////////////////
  const filtered = users
    .filter((u) =>
      `${u.name || ""} ${u.location?.address || ""} ${u.service || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .map((u) => {
      if (!myLocation || !u.location) return { ...u, distance: 999 };

      const distance = getDistance(
        myLocation.lat,
        myLocation.lng,
        u.location.lat,
        u.location.lng
      );

      return { ...u, distance };
    })
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  if (loading)
    return (
      <main className="min-h-screen bg-[#111b21] text-white flex items-center justify-center">
        Loading...
      </main>
    );

  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Find Technicians
      </h1>

      {/* MAP BUTTON */}
      <button
        onClick={() => {
          if (!myLocation) return;
          window.open(
            `https://www.google.com/maps?q=${myLocation.lat},${myLocation.lng}`
          );
        }}
        className="mb-4 bg-yellow-500 text-black px-4 py-2 rounded-xl"
      >
        📍 My Location
      </button>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search technicians..."
        className="w-full bg-[#202c33] p-3 rounded-xl mb-5"
      />

      <div className="space-y-4">
        {filtered.map((user) => {
          const distance = user.distance || 0;
          const time = estimateTime(distance);

          return (
            <div
              key={user.id}
              className="bg-[#202c33] p-4 rounded-xl"
            >
              <h2 className="font-bold text-lg">
                {user.name || "No Name"}
              </h2>

              <p className="text-gray-400 text-sm">
                {user.service || "No Skill"}
              </p>

              <p className="text-gray-500 text-sm">
                📍 {user.location?.address || "No Location"}
              </p>

              {user.distance !== 999 && (
                <p className="text-green-400 text-sm mb-3">
                  📏 {distance.toFixed(1)} km • ⏱️ {time}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/chat/${user.id}`}
                  className="bg-blue-600 text-center p-3 rounded-xl"
                >
                  Chat
                </Link>

                <button
                  onClick={() => bookNow(user)}
                  className="bg-green-600 p-3 rounded-xl"
                >
                  Book
                </button>

                <button
                  onClick={() => {
                    if (!user.location) return;
                    window.open(
                      `https://www.google.com/maps?q=${user.location.lat},${user.location.lng}`
                    );
                  }}
                  className="bg-gray-700 p-3 rounded-xl col-span-2"
                >
                  🗺️ View on Map
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}