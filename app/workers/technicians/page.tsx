"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";

import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export default function TechniciansPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [platformRevenue, setPlatformRevenue] = useState(0);
  const [platformCommission, setPlatformCommission] = useState(0);
  const [logo, setLogo] = useState("");

  //////////////////////////////////////////////////////
  // LOAD TECHNICIANS + ADS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsubWorkers = onSnapshot(
      collection(db, "workers"),
      (snap) => {
        const data = snap.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter(
            (user: any) =>
              user.role?.toLowerCase().trim() ===
              "technician"
          )
          .sort((a: any, b: any) => {
            const aGold = a.subscriptionActive ? 1 : 0;
            const bGold = b.subscriptionActive ? 1 : 0;
            return bGold - aGold;
          });

        setWorkers(data);
      }
    );

    const unsubAds = onSnapshot(
      collection(db, "ads"),
      (snap) => {
        const now = new Date();

        const data = snap.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter((ad: any) => {
            if (!ad.createdAt) return false;

            const created =
              ad.createdAt.toDate();

            const diffDays =
              (now.getTime() -
                created.getTime()) /
              (1000 * 60 * 60 * 24);

            return (
              ad.status === "active" &&
              diffDays <= 30
            );
          });

        setAds(data);
      }
    );

    return () => {
      unsubWorkers();
      unsubAds();
    };
  }, []);

  //////////////////////////////////////////////////////
  // AUTO RENEW EXPIRED ADS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const renewAds = async () => {
      const snap = await getDocs(
        collection(db, "ads")
      );

      snap.forEach(async (item) => {
        const data = item.data();

        if (data.status === "expired") {
          await updateDoc(
            doc(db, "ads", item.id),
            {
              status: "active",
              createdAt:
                serverTimestamp(),
            }
          );

          await setDoc(
            doc(db, "platform", "main"),
            {
              totalRevenue:
                increment(20000),
              updatedAt:
                serverTimestamp(),
            },
            { merge: true }
          );
        }
      });
    };

    renewAds();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD PLATFORM MONEY
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadMoney = async () => {
      const ref = doc(
        db,
        "platform",
        "main"
      );

      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setPlatformRevenue(
          data.totalRevenue || 0
        );

        setPlatformCommission(
          data.totalCommission || 0
        );
      }
    };

    loadMoney();
  }, []);

  //////////////////////////////////////////////////////
  // HOME VISIT BOOKING
  //////////////////////////////////////////////////////
  const bookVisit = async (
    worker: any
  ) => {
    const ok = confirm(
      `Book ${worker.name} for home visit?\nDeposit: 1,000 Frw`
    );

    if (!ok) return;

    await setDoc(
      doc(
        db,
        "bookings",
        Date.now().toString()
      ),
      {
        technicianId: worker.id,
        technicianName: worker.name,
        amount: 1000,
        technicianShare: 500,
        platformShare: 500,
        status: "booked",
        createdAt:
          serverTimestamp(),
      }
    );

    await setDoc(
      doc(db, "wallets", worker.id),
      {
        balance: increment(500),
        updatedAt:
          serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      doc(db, "platform", "main"),
      {
        totalRevenue:
          increment(500),
        updatedAt:
          serverTimestamp(),
      },
      { merge: true }
    );

    alert("Booking Confirmed 🏠");
  };

  //////////////////////////////////////////////////////
  // CREATE TEST AD
  //////////////////////////////////////////////////////
const createAd = async () => {
  await addDoc(collection(db, "ads"), {
    name: "ABC Pharmacy",
    location: "Kigali",
    phone: "0780000000",
    logo: logo || "https://via.placeholder.com/80",
    blocked: false,
    deleted: false,
    status: "active",
    monthlyFee: 20000,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "platform", "main"),
    {
      totalRevenue: increment(20000),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  alert("Ad Created ✅");
};

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#111b21] text-white p-5">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">
          Connect to Technician
        </h1>

        <Link
          href="/workers/profile"
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Back
        </Link>
      </div>

      {/* MONEY */}
      <div className="bg-[#202c33] p-4 rounded-xl mb-5 border border-green-600">
        <h2 className="text-green-400 font-bold">
          Platform Earnings
        </h2>

        <p>
          Total Revenue:{" "}
          {platformRevenue} Frw
        </p>

        <p>
          Your Commission:{" "}
          {platformCommission} Frw
        </p>

      </div>
      <input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setLogo(URL.createObjectURL(e.target.files![0]))
  }
  className="mb-3"
/>

      {/* CREATE AD */}
      <button
        onClick={createAd}
        className="bg-yellow-600 px-4 py-2 rounded mb-5"
      >
        + Create Pharmacy Ad
      </button>

      {/* ADS */}<div className="space-y-4 mb-6">
  {ads
    .filter(
      (ad) =>
        !ad.blocked &&
        !ad.deleted &&
        ad.status === "active"
    )
    .map((ad) => (
      <div
        key={ad.id}
        className="bg-yellow-700 p-4 rounded"
      >
        <img
          src={ad.logo}
          className="w-16 h-16 rounded mb-2 bg-white"
        />

        <p>📢 Sponsored</p>
        <p>{ad.name}</p>
        <p>{ad.location}</p>
        <p>{ad.phone}</p>

        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={async () =>
              await updateDoc(doc(db, "ads", ad.id), {
                blocked: true,
              })
            }
            className="bg-red-600 px-3 py-1 rounded"
          >
            🚫 Block
          </button>

          <button
            onClick={async () =>
              await updateDoc(doc(db, "ads", ad.id), {
                blocked: false,
              })
            }
            className="bg-green-600 px-3 py-1 rounded"
          >
            ✅ Unblock
          </button>

          <button
            onClick={async () =>
              await updateDoc(doc(db, "ads", ad.id), {
                deleted: true,
              })
            }
            className="bg-gray-800 px-3 py-1 rounded"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    ))}
</div>

      {/* TECHNICIANS */}
      <div className="space-y-4">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className={`p-4 rounded-xl ${
              worker.subscriptionActive
                ? "bg-yellow-600"
                : "bg-[#202c33]"
            }`}
          >
            <div className="flex gap-2 mb-3 flex-wrap">
              {worker.subscriptionActive && (
                <span className="bg-black px-2 py-1 rounded text-xs">
                  👑 GOLD
                </span>
              )}

              {worker.verified && (
                <span className="bg-blue-700 px-2 py-1 rounded text-xs">
                  ✔ VERIFIED
                </span>
              )}

              {worker.online ? (
                <span className="bg-green-700 px-2 py-1 rounded text-xs">
                  ONLINE
                </span>
              ) : (
                <span className="bg-gray-600 px-2 py-1 rounded text-xs">
                  OFFLINE
                </span>
              )}
            </div>

            <p>Name: {worker.name}</p>
            <p>Phone: {worker.phone}</p>
            <p>Location: {worker.location}</p>
            <p>Service: {worker.service}</p>

            <div className="mt-4 flex gap-2 flex-wrap">
              <Link
                href={`/chat/${encodeURIComponent(
                  worker.id
                )}`}
                className="bg-green-600 px-4 py-2 rounded"
              >
                Pay 2,000 Frw & Chat
              </Link>

              <button
                onClick={() =>
                  bookVisit(worker)
                }
                className="bg-orange-600 px-4 py-2 rounded"
              >
                🏠 Book Home Visit
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}