"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "workers", id as string));
      if (snap.exists()) {
        setUser(snap.data());
      }
    };

    load();
  }, [id]);

  if (!user) {
    return <p className="text-white p-6">Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-[#0b1f3a] text-white p-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()}>← Back</button>

        <h1 className="font-bold">Patient Profile</h1>

        <Link href="/">🏠 Home</Link>
      </div>

      {/* PROFILE */}
      <div className="text-center">
        <img
          src={user.photo || "/default-avatar.png"}
          className="w-24 h-24 rounded-full mx-auto"
        />

        <h2 className="text-xl font-bold mt-3">{user.name}</h2>
        <p>{user.email}</p>
      </div>

      {/* INFO */}
      <div className="mt-6 space-y-3">
        <p>📍 {user.location || "No location"}</p>
        <p>📞 {user.phone || "No phone"}</p>
        <p>📝 {user.bio || "No description"}</p>

        <p>
          Status:{" "}
          {user.online ? "🟢 Online" : "⚫ Offline"}
        </p>
      </div>

    </main>
  );
}