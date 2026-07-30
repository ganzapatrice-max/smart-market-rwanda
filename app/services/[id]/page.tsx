"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

export default function ServiceDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const serviceSnap = await getDoc(doc(db, "services", id as string));

      if (!serviceSnap.exists()) return;

      const data = serviceSnap.data();
      setService(data);

      if (data.userId) {
        const workerSnap = await getDoc(doc(db, "workers", data.userId));

        if (workerSnap.exists()) {
          setSeller(workerSnap.data());
        }
      }
    };

    if (id) load();
  }, [id]);

  if (!service)
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        Loading...
      </main>
    );

  return (
    <main className="min-h-screen bg-[#0f172a] text-white pb-10">

      {/* HEADER */}
      <div className="bg-green-600 p-4 flex justify-between items-center">

        <button
          onClick={() => router.back()}
          className="bg-white text-green-700 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>

        <h1 className="font-bold text-xl">
          Service Details
        </h1>

        <button
          onClick={() => router.push("/services")}
          className="bg-white text-green-700 px-4 py-2 rounded-lg"
        >
          Services
        </button>

      </div>

      <div className="max-w-3xl mx-auto p-5">

        {/* Seller */}

        <div
          onClick={() => router.push(`/workers/${service.userId}`)}
          className="bg-[#111827] rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#1f2937]"
        >

          <img
            src={seller?.photo || "/default-avatar.png"}
            className="w-20 h-20 rounded-full object-cover"
          />

          <div>

            <h2 className="text-xl font-bold">
              {seller?.name || "Seller"}
            </h2>

            <p className="text-gray-400">
              {seller?.service}
            </p>

            <p className="text-gray-500">
              {seller?.location}
            </p>

            <p className="text-blue-400">
              View Seller Profile →
            </p>

          </div>

        </div>

        {/* Photos */}

        {service.photos?.length > 0 && (

          <div className="grid grid-cols-2 gap-3 mt-6">

            {service.photos.map((img: string, index: number) => (

              <img
                key={index}
                src={img}
                className="rounded-xl w-full h-56 object-cover"
              />

            ))}

          </div>

        )}

        {/* Information */}

        <div className="bg-[#111827] rounded-xl p-6 mt-6">

          <h1 className="text-3xl font-bold mb-4">
            {service.title}
          </h1>

          <p className="text-gray-300 whitespace-pre-wrap">
            {service.description}
          </p>

          <div className="mt-6 space-y-2">

            <p className="text-green-400 text-2xl font-bold">
              {service.price} RWF
            </p>

            <p>📂 {service.category}</p>

            <p>📍 {service.location}</p>

            <p>📞 {service.phone}</p>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="grid grid-cols-2 gap-4 mt-6">

          <button
            className="bg-green-600 py-3 rounded-xl font-bold"
          >
            🛒 Buy
          </button>

          <a
            href={`tel:${service.phone}`}
            className="bg-blue-600 py-3 rounded-xl text-center font-bold"
          >
            📞 Call
          </a>

          <a
            href={`https://wa.me/${service.phone.replace(/\D/g, "")}`}
            target="_blank"
            className="bg-green-500 py-3 rounded-xl text-center font-bold"
          >
            WhatsApp
          </a>

          <button
            onClick={() => router.push(`/chat/${service.userId}`)}
            className="bg-purple-600 py-3 rounded-xl font-bold"
          >
            💬 Message
          </button>

        </div>

      </div>

    </main>
  );
}