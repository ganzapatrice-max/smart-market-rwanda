"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function BookingDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);

  //////////////////////////////////////////////////////
  // LOAD BOOKING
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "bookings", id as string));
      if (snap.exists()) setBooking(snap.data());
    };
    load();
  }, [id]);

  //////////////////////////////////////////////////////
  // CANCEL
  //////////////////////////////////////////////////////
  const cancelBooking = async () => {
    await updateDoc(doc(db, "bookings", id as string), {
      status: "cancelled",
    });

    setBooking({ ...booking, status: "cancelled" });
  };

  //////////////////////////////////////////////////////
  // ACCEPT
  //////////////////////////////////////////////////////
  const acceptBooking = async () => {
    await updateDoc(doc(db, "bookings", id as string), {
      status: "accepted",
    });

    setBooking({ ...booking, status: "accepted" });
  };

  if (!booking) return <p className="text-white p-6">Loading...</p>;

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-black text-white pb-24">

      {/* TOP NAV */}
      <div className="bg-green-600 p-4 flex justify-between items-center">

        <button onClick={() => router.back()}>
          ← Back
        </button>

        <h1 className="font-bold">Booking</h1>

        <div className="flex gap-3">
          <Link href="/post">Post</Link>
          <Link href="/feed">Feeds</Link>
        </div>

      </div>

      {/* CONTENT */}
      <div className="p-5">

        <div className="bg-white/10 p-5 rounded-2xl space-y-3">

          <h2 className="text-lg font-bold mb-2">
            Booking Details
          </h2>

          <p><b>📍 Location:</b> {booking.location || "Not set"}</p>

          <p><b>⏰ Time:</b> {booking.time || "Not set"}</p>

          <p>
            <b>👤 Technician:</b>{" "}
            {booking.technicianName || "Unknown"}
          </p>

          <p>
            <b>🙍 Patient:</b>{" "}
            {booking.patientName || "Unknown"}
          </p>

          <p>
            <b>Status:</b>{" "}
            <span
              className={`px-2 py-1 rounded ${
                booking.status === "pending"
                  ? "bg-yellow-500"
                  : booking.status === "accepted"
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {booking.status}
            </span>
          </p>

        </div>

        {/* ACTION BUTTONS */}
        {booking.status !== "cancelled" && (
          <div className="flex gap-3 mt-6">

            {/* LEFT = CANCEL */}
            <button
              onClick={cancelBooking}
              className="flex-1 bg-red-600 p-4 rounded-xl"
            >
              ❌ Cancel
            </button>

            {/* RIGHT = ACCEPT */}
            {booking.status !== "accepted" && (
              <button
                onClick={acceptBooking}
                className="flex-1 bg-green-600 p-4 rounded-xl"
              >
                ✅ Accept
              </button>
            )}

          </div>
        )}

      </div>

    </main>
  );
}