"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

export default function PhotosPage() {
  const { id } = useParams();
  const router = useRouter();

  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "workers", id as string));
      if (snap.exists()) {
        setPhotos(snap.data().photos || []);
      }
    };

    load();
  }, [id]);

  return (
    <main className="min-h-screen bg-black text-white p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => router.back()}>← Back</button>
        <h1 className="font-bold">All Photos</h1>
        <div />
      </div>

      {/* CONTENT */}
      {photos.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">
          No photos uploaded
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-full h-40 object-cover rounded-xl"
            />
          ))}
        </div>
      )}

    </main>
  );
}