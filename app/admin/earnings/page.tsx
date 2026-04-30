"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

type Earning = {
  id: string;
  amount: number;
  orderId?: string;
  createdAt?: any;
};

type Withdrawal = {
  id: string;
  amount: number;
  status: string;
};

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // LOAD EARNINGS
  //////////////////////////////////////////////////////
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

      const sum = data.reduce((acc, e) => acc + (e.amount || 0), 0);
      setTotal(sum);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD WITHDRAWALS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "withdrawals"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Withdrawal[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Withdrawal, "id">),
      }));

      setWithdrawals(data);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // 💸 WITHDRAW
  //////////////////////////////////////////////////////
  const handleWithdraw = async () => {
    if (total <= 0) {
      alert("No money to withdraw");
      return;
    }

    const hasPending = withdrawals.some((w) => w.status === "pending");

    if (hasPending) {
      alert("⏳ You already have a pending withdrawal");
      return;
    }

    setLoading(true);

    await addDoc(collection(db, "withdrawals"), {
      amount: total,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setLoading(false);

    alert("💸 Withdrawal request sent!");
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">

      <h1 className="text-xl font-bold">💰 Your Earnings</h1>

      {/* TOTAL */}
      <div className="bg-green-600 text-white p-4 rounded-xl shadow">
        <p className="text-sm">Total Earnings</p>
        <p className="text-2xl font-bold">{total} RWF</p>

        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="mt-3 bg-white text-green-600 px-4 py-2 rounded font-semibold"
        >
          {loading ? "Processing..." : "Withdraw 💸"}
        </button>
      </div>

      {/* WITHDRAWALS */}
      <div>
        <h2 className="font-semibold mb-2">Withdrawals</h2>

        {withdrawals.map((w) => (
          <div key={w.id} className="bg-yellow-100 p-3 rounded mb-2">
            <p>{w.amount} RWF</p>
            <p className="text-xs">{w.status}</p>
          </div>
        ))}
      </div>

      {/* EARNINGS LIST */}
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