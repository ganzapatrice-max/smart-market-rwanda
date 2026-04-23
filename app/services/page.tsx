"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
const [search, setSearch] = useState("");
  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setServices(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  return (
    <main className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Services</h1>
      <input
  placeholder="Search services..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full mb-4 p-3 rounded text-white"
/>


      <div className="space-y-4">
        {services
  .filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase())
  )
  .map((s) => (
          <div key={s.id} className="bg-gray-800 p-4 rounded-xl">
            <h2 className="text-lg font-bold">{s.title}</h2>
            <p>{s.description}</p>
            <p className="text-green-400">{s.price} RWF</p>
            <p className="text-sm text-gray-400">{s.location}</p>
            <p className="text-sm text-blue-400">{s.phone}</p>
                <a
      href={`tel:${s.phone}`}
      className="bg-green-600 px-3 py-1 rounded inline-block mt-2"
    >
      📞 Call
    </a>
          </div>
        ))}
      </div>
    </main>
  );
}