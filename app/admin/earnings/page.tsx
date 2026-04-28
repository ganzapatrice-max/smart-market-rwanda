"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// ✅ ADD TYPE
type Earning = {
  id: string;
  amount: number;
  orderId?: string;
  createdAt?: any;
};

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "earnings"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Earning[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Earning, "id">),
      }));

      setEarnings(data);

      // ✅ FIXED (Type safe)
      const sum = data.reduce((acc, e) => acc + (e.amount || 0), 0);
      setTotal(sum);
    });

    return () => unsub();
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">

      <h1 className="text-xl font-bold">💰 Your Earnings</h1>

      {/* TOTAL */}
      <div className="bg-green-600 text-white p-4 rounded-xl shadow">
        <p className="text-sm">Total Earnings</p>
        <p className="text-2xl font-bold">{total} RWF</p>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {earnings.map((e) => (
          <div key={e.id} className="bg-white p-3 rounded shadow">
            <p className="font-semibold">+{e.amount} RWF</p>
            <p className="text-xs text-gray-500">
              {e.createdAt?.toDate?.().toLocaleString?.() || ""}
            </p>
          </div>
        ))}
      </div>

      {earnings.length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          No earnings yet
        </p>
      )}
    </main>
  );
}