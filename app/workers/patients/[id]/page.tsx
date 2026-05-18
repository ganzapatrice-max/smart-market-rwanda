"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "workers", id as string));
      if (snap.exists()) setUser(snap.data());
    };
    load();
  }, [id]);

  //////////////////////////////////////////////////////
  // PAYMENT
  //////////////////////////////////////////////////////
  useEffect(() => {
    getDoc(doc(db, "payments", id as string)).then((snap) => {
      if (snap.exists()) setPaid(true);
    });
  }, [id]);

  //////////////////////////////////////////////////////
  // BOOKINGS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "bookings"),
      where("patientId", "==", id)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => doc.data());
      setBookings(data);
    });

    return () => unsub();
  }, [id]);

  //////////////////////////////////////////////////////
  // UPLOAD PHOTO (simple URL input for now)
  //////////////////////////////////////////////////////
  const uploadPhoto = async () => {
    const url = prompt("Paste image URL");
    if (!url) return;

    const updated = [...(user.photos || []), url];

    await setDoc(
      doc(db, "workers", id as string),
      { photos: updated },
      { merge: true }
    );

    setUser({ ...user, photos: updated });
  };

  if (!user) return <p className="text-white p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#071226] text-white pb-20">

      {/* HEADER */}
      <div className="flex justify-between items-center p-4">
        <button onClick={() => router.back()}>← Back</button>
        <h1 className="font-bold">Patient Profile</h1>

        {/* ✅ PHOTOS BUTTON */}
        <Link
          href={`/workers/patients/${id}/photos`}
          className="text-sm bg-gray-700 px-3 py-1 rounded"
        >
          📸 Photos
        </Link>
      </div>

      {/* PROFILE */}
      <div className="text-center mt-4 px-4">
        <img
          src={user.photo || "/default-avatar.png"}
          className="w-28 h-28 rounded-full mx-auto border-4 border-white"
        />

        <h2 className="text-xl font-bold mt-3">{user.name}</h2>
        <p className="text-gray-300">{user.email}</p>
      </div>

      {/* INFO */}
      <div className="mx-4 mt-6 bg-white/10 rounded-xl p-4 space-y-3">
        <p>📍 {user.location || "No location"}</p>
        <p>🛠 {user.service || "No service"}</p>
        <p>📞 {user.phone || "No phone"}</p>
        <p>📝 {user.bio || "No description"}</p>
        <p>{user.online ? "🟢 Online" : "⚫ Offline"}</p>
      </div>

      {/* ✅ UPLOAD BUTTON */}
      <div className="mx-4 mt-4">
        <button
          onClick={uploadPhoto}
          className="w-full bg-purple-600 p-3 rounded-xl"
        >
          ➕ Upload Problem Photo
        </button>
      </div>

      {/* PREVIEW PHOTOS */}
      {user.photos?.length > 0 && (
        <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
          {user.photos.map((img: string, i: number) => (
            <img
              key={i}
              src={img}
              className="w-full h-24 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* ✅ BOOKINGS BUTTON */}
      <div className="mx-4 mt-6">
        <Link
          href={`/workers/patients/${id}/bookings`}
          className="block w-full bg-orange-500 text-center p-3 rounded-xl"
        >
          📅 View Booked Technicians ({bookings.length})
        </Link>
      </div>

      {/* ACTIONS */}
      <div className="mx-4 mt-6 space-y-3">

        {!paid ? (
          <button
            onClick={async () => {
              await setDoc(doc(db, "payments", id as string), {
                paid: true,
                createdAt: new Date(),
              });
              setPaid(true);
            }}
            className="w-full bg-green-500 p-4 rounded-xl"
          >
            💬 Pay 2,000 FRW to Chat
          </button>
        ) : (
          <Link
            href={`/chat/${id}`}
            className="block text-center bg-green-600 p-4 rounded-xl"
          >
            💬 Chat
          </Link>
        )}

        <button
          onClick={() => {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                user.location
              )}`
            );
          }}
          className="w-full bg-blue-600 p-4 rounded-xl"
        >
          📍 Open GPS
        </button>
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b1f3a] p-3 flex justify-around">
        <button onClick={() => router.back()}>⬅ Back</button>
        <Link href="/">🏠 Home</Link>
        <Link href="/post">➕ Post</Link>
        <Link href="/feed">📰 Feeds</Link>
      </div>

    </main>
  );
}