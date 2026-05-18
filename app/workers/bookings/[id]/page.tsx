"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

export default function BookingDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "bookings", id as string));
      if (snap.exists()) setBooking(snap.data());
    };

    load();
  }, [id]);

  const cancelBooking = async () => {
    await updateDoc(doc(db, "bookings", id as string), {
      status: "cancelled",
    });

    alert("Booking cancelled ❌");
    router.push("/workers/bookings");
  };

  if (!booking) return <p className="text-white p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-black text-white p-6 space-y-4">

      <h1 className="text-xl font-bold">Booking Details</h1>

      <p><b>Technician:</b> {booking.technicianName}</p>
      <p><b>Status:</b> {booking.status}</p>

      {booking.status !== "cancelled" && (
        <button
          onClick={cancelBooking}
          className="bg-red-600 p-3 rounded-xl"
        >
          Cancel Booking
        </button>
      )}

    </main>
  );
}