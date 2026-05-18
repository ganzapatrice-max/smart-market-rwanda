"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { getDistance } from "@/lib/location";

type Worker = {
  id: string;
  name?: string;
  role?: string;
  photoURL?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  service?: string;
  distance?: number;
};

export default function TechniciansPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState("");
  const [myLocation, setMyLocation] = useState<any>(null);

  //////////////////////////////////////////////////////
  // GET USER GPS
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
  // LOAD TECHNICIANS (REALTIME)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "workers"), // ✅ FIXED
      (snap) => {
        const data: Worker[] = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          }))
          .filter((u) => u.role === "technician")
          .map((u: any) => {
            if (!myLocation || !u.location) {
              return { ...u, distance: 999 };
            }

            const distance = getDistance(
              myLocation.lat,
              myLocation.lng,
              u.location.lat,
              u.location.lng
            );

            return { ...u, distance };
          })
          .sort((a: any, b: any) => a.distance - b.distance);

        setWorkers(data);
      }
    );

    return () => unsub();
  }, [myLocation]);

  //////////////////////////////////////////////////////
  // SEARCH
  //////////////////////////////////////////////////////
  const filtered = workers.filter((u) =>
    `${u.name || ""} ${u.location?.address || ""} ${u.service || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#111b21] text-white p-5">
      <h1 className="text-2xl font-bold mb-4">
        Connect to Technician
      </h1>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, service, location..."
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
        {filtered.map((worker) => (
          <Link
            key={worker.id}
            href={`/workers/technicians/${worker.id}`} // ✅ FIXED
            className="flex items-center gap-3 bg-[#202c33] p-3 rounded-xl"
          >
            <img
              src={
                worker.photoURL ||
                "/default-avatar.png"
              }
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold">
                {worker.name || "No Name"}
              </p>

              <p className="text-sm text-gray-400">
                {worker.location?.address ||
                  "No location"}
              </p>

              {worker.distance !== 999 && (
                <p className="text-green-400 text-xs">
                  📍 {worker.distance?.toFixed(1)} km away
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}