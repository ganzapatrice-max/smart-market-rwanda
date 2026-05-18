"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientBookingsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // LOAD BOOKINGS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "bookings"),
      where("patientId", "==", id)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map((doc) => doc.data());
      setBookings(data);

      //////////////////////////////////////////////////////
      // LOAD TECHNICIANS INFO
      //////////////////////////////////////////////////////
      const techs = await Promise.all(
        data.map(async (b: any) => {
          const snap = await getDoc(
            doc(db, "workers", b.technicianId)
          );

          if (snap.exists()) {
            return {
              id: b.technicianId,
              ...snap.data(),
            };
          }

          return null;
        })
      );

      setTechnicians(techs.filter(Boolean));
    });

    return () => unsub();
  }, [id]);

  return (
    <main className="min-h-screen bg-[#0b1f3a] text-white p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => router.back()}>← Back</button>
        <h1 className="font-bold">Booked Technicians</h1>
        <div />
      </div>

      {/* CONTENT */}
      {technicians.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">
          No bookings yet
        </p>
      ) : (
        <div className="space-y-3">
          {technicians.map((tech: any) => (
            <Link
              key={tech.id}
              href={`/workers/technicians/${tech.id}`}
              className="block bg-[#202c33] p-4 rounded-xl"
            >
              <div className="flex items-center gap-3">

                <img
                  src={tech.photo || "/default-avatar.png"}
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div>
                  <p className="font-semibold">{tech.name}</p>
                  <p className="text-sm text-gray-400">
                    {tech.service}
                  </p>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}