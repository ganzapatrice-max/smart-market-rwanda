"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { collection, addDoc } from "firebase/firestore";
import { auth } from "../../../../lib/firebase";

export default function TechnicianProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "workers", id as string));
      if (snap.exists()) setUser(snap.data());

      const paySnap = await getDoc(doc(db, "payments", id as string));
      if (paySnap.exists()) setPaid(true);

      const bookSnap = await getDoc(doc(db, "bookings", id as string));
      if (bookSnap.exists()) setBooked(true);
    };

    load();
  }, [id]);

  const payForChat = async () => {
    await setDoc(doc(db, "payments", id as string), {
      paid: true,
      amount: 2000,
      createdAt: new Date(),
    });
    setPaid(true);
  };

const bookNow = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert("Login first");
    return;
  }

  await addDoc(collection(db, "bookings"), {
    clientId: currentUser.uid,
    technicianId: id,
    clientName: currentUser.email,
    technicianName: user.name,
    status: "pending",
    createdAt: new Date(),
  });

  setBooked(true);
  alert("Booking sent ✅");
};

  if (!user) return <p className="text-white p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#071226] text-white pb-20">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4">
        <button onClick={() => router.back()} className="text-white text-xl">
          ← back
        </button>

        <h1 className="font-semibold text-lg">Smart Market</h1>

        {/* ✅ FIXED HOME */}
        <Link href="/" className="text-white text-sm">
          🏠 Home
        </Link>
      </div>

      {/* PROFILE */}
      <div className="flex flex-col items-center mt-6 px-4">
        <img
          src={user.photo || "/default-avatar.png"}
          className="w-28 h-28 rounded-full border-4 border-white object-cover"
        />

        <h2 className="text-2xl font-bold mt-4 flex items-center gap-2">
          {user.name}
          {user.verified && <span className="text-blue-400">✔</span>}
        </h2>

        <p className="text-gray-300 text-sm">{user.email}</p>
      </div>

      {/* INFO */}
      <div className="mx-4 mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 space-y-4">

        <div className="flex items-center gap-3">
          <span>📍</span>
          <div>
            <p className="text-gray-300 text-sm">Location</p>
            <p className="font-semibold">{user.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span>🛠</span>
          <div>
            <p className="text-gray-300 text-sm">Service</p>
            <p className="font-semibold">{user.service}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span>📞</span>
          <div>
            <p className="text-gray-300 text-sm">Phone</p>
            <p className="font-semibold">{user.phone}</p>
          </div>
        </div>
      </div>

      {/* STATUS */}
      <div className="mx-4 mt-4 bg-white/10 rounded-xl p-4 flex justify-between items-center">

        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${user.online ? "bg-green-500" : "bg-gray-500"}`}></span>
          <span className="text-sm">
            {user.online ? "Online" : "Offline"}
          </span>
        </div>

        {/* ✅ FIXED BOOKED CLICK */}
        {booked && (
          <Link
            href={`/workers/bookings/${id}`}
            className="flex items-center gap-2 text-orange-400"
          >
            📅 View Booking
          </Link>
        )}
      </div>

      {/* ACTIONS */}
      <div className="px-4 mt-6 space-y-3">

        {!paid ? (
          <button
            onClick={payForChat}
            className="w-full bg-green-500 hover:bg-green-600 p-4 rounded-xl font-semibold"
          >
            💬 Pay 2,000 FRW to Chat
          </button>
        ) : (
          <Link
            href={`/chat/${id}`}
            className="block w-full text-center bg-green-600 p-4 rounded-xl font-semibold"
          >
            💬 Chat with {user.name}
          </Link>
        )}

        {!booked ? (
          <button
            onClick={bookNow}
            className="w-full bg-orange-500 hover:bg-orange-600 p-4 rounded-xl font-semibold"
          >
            📅 Book Now
          </button>
        ) : (
          <button className="w-full bg-gray-600 p-4 rounded-xl font-semibold">
            ✔ Already Booked
          </button>
        )}

        <button
          onClick={() => {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.location)}`
            );
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-semibold"
        >
          📍 Open GPS Location
        </button>
      </div>

      {/* ✅ FIXED BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b1f3a] p-3 flex justify-around text-sm">

        <Link href="/" className="text-white text-center">
          🏠 Home
        </Link>

        <Link href="/workers/bookings" className="text-white text-center">
          📅 Bookings
        </Link>

        <Link href="/post" className="text-white text-center">
          ➕ Post
        </Link>

        <Link href="/feed" className="text-white text-center">
          📰 Feed
        </Link>

<Link href="/workers/technician/bookings">
  📥 Requests
</Link>
      </div>

    </main>
  );
}