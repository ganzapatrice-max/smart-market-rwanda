"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function TechnicianBookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("technicianId", "==", user.uid)
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

  //////////////////////////////////////////////////////
  // ACCEPT
  //////////////////////////////////////////////////////
  const acceptBooking = async (id: string) => {
    await updateDoc(doc(db, "bookings", id), {
      status: "accepted",
    });
  };

  //////////////////////////////////////////////////////
  // REJECT
  //////////////////////////////////////////////////////
  const rejectBooking = async (id: string) => {
    await updateDoc(doc(db, "bookings", id), {
      status: "rejected",
    });
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-black text-white p-5">
      <h1 className="text-xl font-bold mb-4">
        Incoming Bookings
      </h1>

      {bookings.length === 0 && (
        <p className="text-gray-400">
          No bookings yet
        </p>
      )}

      {bookings.map((b) => (
        <div
          key={b.id}
          className="bg-gray-800 p-4 rounded-xl mb-3 space-y-2"
        >
          <p><b>Client:</b> {b.clientName}</p>
          <p><b>Status:</b> {b.status}</p>

          {b.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => acceptBooking(b.id)}
                className="bg-green-600 px-3 py-2 rounded"
              >
                Accept
              </button>

              <button
                onClick={() => rejectBooking(b.id)}
                className="bg-red-600 px-3 py-2 rounded"
              >
                Reject
              </button>
            </div>
          )}

          {b.status === "accepted" && (
            <p className="text-green-400">✅ Accepted</p>
          )}

          {b.status === "rejected" && (
            <p className="text-red-400">❌ Rejected</p>
          )}
        </div>
      ))}
    </main>
  );
}