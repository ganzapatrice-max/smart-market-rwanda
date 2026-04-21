"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function AdsAdminPage() {
  const [ads, setAds] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // LOAD ADS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "ads"),
      (snap) => {
        const data = snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setAds(data);
      }
    );

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // BLOCK / UNBLOCK
  //////////////////////////////////////////////////////
  const toggleBlock = async (
    id: string,
    current: boolean
  ) => {
    await updateDoc(doc(db, "ads", id), {
      blocked: !current,
      updatedAt: serverTimestamp(),
    });
  };

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////
  const removeAd = async (id: string) => {
    const ok = confirm(
      "Delete this ad permanently?"
    );

    if (!ok) return;

    await deleteDoc(doc(db, "ads", id));
  };

  //////////////////////////////////////////////////////
  // RENEW
  //////////////////////////////////////////////////////
  const renewAd = async (id: string) => {
    await updateDoc(doc(db, "ads", id), {
      status: "active",
      blocked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    alert("Ad renewed ✅");
  };

  //////////////////////////////////////////////////////
  // CREATE TEST AD
  //////////////////////////////////////////////////////
  const createTestAd = async () => {
    await addDoc(collection(db, "ads"), {
      name: "New Pharmacy",
      phone: "0780000000",
      location: "Kigali",
      monthlyFee: 20000,
      status: "active",
      blocked: false,
      createdAt: serverTimestamp(),
    });

    alert("Test ad created ✅");
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#111b21] text-white p-5">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Ads Management
        </h1>

        <Link
          href="/admin"
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Back
        </Link>
      </div>

      {/* CREATE TEST AD */}
      <button
        onClick={createTestAd}
        className="bg-yellow-600 px-4 py-2 rounded mb-5"
      >
        + Create Test Ad
      </button>

      {/* ADS LIST */}
      <div className="space-y-4">
        {ads.length === 0 ? (
          <p>No ads found.</p>
        ) : (
          ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-[#202c33] p-4 rounded-xl"
            >
              {/* STATUS */}
              <div className="flex gap-2 flex-wrap mb-3">
                {ad.status === "active" ? (
                  <span className="bg-green-600 px-2 py-1 rounded text-xs">
                    ACTIVE
                  </span>
                ) : (
                  <span className="bg-gray-600 px-2 py-1 rounded text-xs">
                    EXPIRED
                  </span>
                )}

                {ad.blocked && (
                  <span className="bg-red-600 px-2 py-1 rounded text-xs">
                    🚫 BLOCKED
                  </span>
                )}
              </div>

              {/* INFO */}
              <p>Name: {ad.name}</p>
              <p>Phone: {ad.phone}</p>
              <p>Location: {ad.location}</p>
              <p>Fee: {ad.monthlyFee} Frw</p>

              {/* ACTIONS */}
              <div className="flex gap-2 flex-wrap mt-4">
                <button
                  onClick={() =>
                    toggleBlock(
                      ad.id,
                      ad.blocked
                    )
                  }
                  className="bg-red-600 px-3 py-2 rounded"
                >
                  {ad.blocked
                    ? "✅ Unblock"
                    : "🚫 Block"}
                </button>

                <button
                  onClick={() =>
                    renewAd(ad.id)
                  }
                  className="bg-blue-600 px-3 py-2 rounded"
                >
                  🔄 Renew
                </button>

                <button
                  onClick={() =>
                    removeAd(ad.id)
                  }
                  className="bg-gray-800 px-3 py-2 rounded"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}