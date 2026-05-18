"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // LOAD PROFILE USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "workers", id as string));
      if (snap.exists()) setUser(snap.data());
    };
    load();
  }, [id]);

  //////////////////////////////////////////////////////
  // LOAD CURRENT LOGGED USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadCurrent = async () => {
      const u = auth.currentUser;
      if (!u) return;

      const snap = await getDoc(doc(db, "workers", u.uid));
      if (snap.exists()) setCurrentUser(snap.data());
    };

    loadCurrent();
  }, []);

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

  if (!user) return <p className="text-white p-6">Loading...</p>;

  const isOwner =
    currentUser?.uid === id && currentUser?.role === "patient";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#071226] text-white pb-28">

      {/* HEADER */}
      <div className="flex justify-between items-center p-4">

        <button onClick={() => router.back()} className="text-lg">
          ← Back
        </button>

        <h1 className="font-bold text-lg">Patient Profile</h1>

        <Link
          href={`/workers/patients/${id}/photos`}
          className="bg-white/10 px-4 py-2 rounded-xl"
        >
          📸 Photos
        </Link>
      </div>

      {/* PROFILE */}
      <div className="text-center mt-4 px-4">
        <img
          src={user.photo || "/default-avatar.png"}
          className="w-32 h-32 rounded-full mx-auto border-4 border-white object-cover"
        />

        <h2 className="text-2xl font-bold mt-4 uppercase">
          {user.name}
        </h2>

        <p className="text-gray-300">{user.email}</p>
      </div>

      {/* INFO */}
      <div className="mx-4 mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 space-y-4">
        <div>📍 <b>{user.location}</b></div>
        <div>🛠 <b>{user.service}</b></div>
        <div>📞 <b>{user.phone}</b></div>
        <div>📝 <b>{user.bio}</b></div>

        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${user.online ? "bg-green-500" : "bg-gray-500"}`}></span>
          <span>{user.online ? "Online" : "Offline"}</span>
        </div>
      </div>

      {/* ACTION GRID */}
      <div className="mx-4 mt-6 grid grid-cols-2 gap-4">

        {/* ✅ ONLY PATIENT OWNER CAN UPLOAD */}
        {isOwner && (
          <Link
            href={`/workers/patients/${id}/upload`}
            className="bg-purple-600 p-4 rounded-xl text-center font-semibold"
          >
            📷 Add Photo
          </Link>
        )}

        <Link
          href={`/workers/patients/${id}/bookings`}
          className="bg-orange-500 p-4 rounded-xl text-center font-semibold"
        >
          📅 Bookings ({bookings.length})
        </Link>

        {!paid ? (
          <button
            onClick={async () => {
              await setDoc(doc(db, "payments", id as string), {
                paid: true,
                createdAt: new Date(),
              });
              setPaid(true);
            }}
            className="bg-green-500 p-4 rounded-xl font-semibold"
          >
            💬 Pay Chat
          </button>
        ) : (
          <Link
            href={`/chat/${id}`}
            className="bg-green-600 p-4 rounded-xl text-center font-semibold"
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
          className="bg-blue-600 p-4 rounded-xl font-semibold"
        >
          📍 GPS
        </button>
      </div>

     {/* PHOTOS PREVIEW */}
{user.photos?.length > 0 && (
  <div className="mx-4 mt-6">

    <p className="font-semibold mb-3">
      📸 Problem Photos
    </p>

    <div className="grid grid-cols-2 gap-4">
      {user.photos.map((img: any, i: number) => (
        <div
          key={i}
          className="bg-white/10 p-2 rounded-xl"
        >
          <img
            src={img.url}
            className="w-full h-32 object-cover rounded-lg mb-2"
          />

          {/* DESCRIPTION */}
          <p className="text-sm text-gray-300">
            {img.description || "No description"}
          </p>
        </div>
      ))}
    </div>

  </div>
)}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b1f3a] border-t border-white/10">
        <div className="flex justify-around items-center py-5 text-sm">

          <button onClick={() => router.back()}>
            ⬅ Back
          </button>

          <Link href="/">🏠 Home</Link>
          <Link href="/post">➕ Post</Link>
          <Link href="/feed">📰 Feeds</Link>

        </div>
      </div>

    </main>
  );
}