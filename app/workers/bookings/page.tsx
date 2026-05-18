"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../../lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("clientId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBookings(data);
    });

    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <h1 className="text-xl font-bold mb-4">My Bookings</h1>

      {bookings.map((b) => (
        <Link
          key={b.id}
          href={`/workers/bookings/${b.id}`}
          className="block bg-gray-800 p-4 rounded-xl mb-3"
        >
          <p>{b.technicianName}</p>
          <p className="text-sm text-gray-400">{b.status}</p>
        </Link>
      ))}
    </main>
  );
}