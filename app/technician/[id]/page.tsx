"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function TechnicianProfile() {
  const { id } = useParams();
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

  if (!user) return <p>Loading...</p>;

  return (
    <main className="p-6 text-white bg-[#111b21] min-h-screen">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p>Location: {user.location}</p>
      <p>Service: {user.service}</p>
      <p>Phone: {user.phone}</p>
    </main>
  );
}