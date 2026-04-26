"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

export default function ServiceDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [service, setService] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "services", id as string));
      if (snap.exists()) {
        setService(snap.data());
      }
    };
    if (id) load();
  }, [id]);

  if (!service) return <p className="p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-xl mx-auto bg-[#111827] p-6 rounded-2xl">

        <h1 className="text-2xl font-bold mb-2">
          {service.title}
        </h1>

        <p className="text-gray-300 mb-4">
          {service.description}
        </p>

        <p className="text-green-400 text-lg mb-2">
          {service.price} RWF
        </p>

        <p className="text-sm text-gray-400">
          📍 {service.location}
        </p>

        <p className="text-sm text-blue-400 mb-4">
          📞 {service.phone}
        </p>

        {/* CALL */}
        <a
          href={`tel:${service.phone}`}
          className="block bg-green-600 text-center py-2 rounded mb-3"
        >
          📞 Call Seller
        </a>

        {/* MESSAGE */}
        <button
          onClick={() => router.push(`/chat/${service.userId}`)}
          className="w-full bg-blue-600 py-2 rounded"
        >
          💬 Message Seller
        </button>

      </div>
    </main>
  );
}