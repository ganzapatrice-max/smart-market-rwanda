"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

      // payment check
      const paySnap = await getDoc(doc(db, "payments", id as string));
      if (paySnap.exists()) setPaid(true);

      // booking check
      const bookSnap = await getDoc(doc(db, "bookings", id as string));
      if (bookSnap.exists()) setBooked(true);
    };

    load();
  }, [id]);

  //////////////////////////////////////////////////////
  // PAY
  //////////////////////////////////////////////////////
  const payForChat = async () => {
    await setDoc(doc(db, "payments", id as string), {
      paid: true,
      amount: 2000,
      createdAt: new Date(),
    });

    setPaid(true);
  };

  //////////////////////////////////////////////////////
  // BOOK
  //////////////////////////////////////////////////////
  const bookNow = async () => {
    await setDoc(doc(db, "bookings", id as string), {
      booked: true,
      createdAt: new Date(),
    });

    setBooked(true);
  };

  if (!user) return <p className="text-white p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">

      {/* TOP NAV */}
      <div className="flex justify-between mb-4">
        <button onClick={() => router.back()} className="bg-gray-700 px-3 py-2 rounded">
          ⬅ Back
        </button>

        <Link href="/" className="bg-blue-600 px-3 py-2 rounded">
          🏠 Home
        </Link>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-[#202c33] p-6 rounded-xl space-y-4">

        {/* PHOTO */}
        <img
          src={user.photo || "/default-avatar.png"}
          className="w-24 h-24 rounded-full mx-auto object-cover"
        />

        {/* NAME */}
        <h1 className="text-2xl font-bold text-center">
          {user.name || "No Name"}
        </h1>

        {/* EMAIL */}
        <p className="text-center text-gray-400">
          {user.email}
        </p>

        {/* INFO */}
        <p><b>📍 Location:</b> {user.location}</p>
        <p><b>🛠 Service:</b> {user.service}</p>
        <p><b>📞 Phone:</b> {user.phone}</p>

        {/* BADGES */}
        <div className="flex flex-wrap gap-2 justify-center">

          {user.verified && (
            <span className="bg-blue-600 px-2 py-1 rounded text-xs">
              ✔ Verified
            </span>
          )}

          {user.subscriptionActive && (
            <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs">
              👑 Subscribed
            </span>
          )}

          {user.online ? (
            <span className="bg-green-600 px-2 py-1 rounded text-xs">
              🟢 Online
            </span>
          ) : (
            <span className="bg-gray-600 px-2 py-1 rounded text-xs">
              ⚫ Offline
            </span>
          )}

          {booked && (
            <span className="bg-orange-600 px-2 py-1 rounded text-xs">
              🏠 Booked
            </span>
          )}
        </div>

        {/* PAYMENT */}
        {!paid ? (
          <button
            onClick={payForChat}
            className="bg-red-600 p-3 rounded-xl w-full"
          >
            🔒 Pay 2,000 FRW to Chat
          </button>
        ) : (
          <Link
            href={`/chat/${id}`}
            className="bg-green-600 p-3 rounded-xl text-center block"
          >
            💬 Chat with {user.name}
          </Link>
        )}

        {/* BOOK */}
        {!booked ? (
          <button
            onClick={bookNow}
            className="bg-orange-600 p-3 rounded-xl w-full"
          >
            🏠 Book Home Visit
          </button>
        ) : (
          <button className="bg-gray-600 p-3 rounded-xl w-full">
            ✔ Already Booked
          </button>
        )}

        {/* GPS */}
        <button
          onClick={() => {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.location)}`
            );
          }}
          className="bg-blue-700 p-3 rounded-xl w-full"
        >
          📍 Open GPS Location
        </button>

      </div>
    </main>
  );
}