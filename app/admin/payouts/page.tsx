"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function PayoutsPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("payoutStatus", "==", "pending")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setOrders(data);
    });

    return () => unsub();
  }, []);

  const markPaid = async (id: string) => {
    await updateDoc(doc(db, "orders", id), {
      payoutStatus: "paid",
    });
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">

      <h1 className="text-xl font-bold">💸 Seller Payouts</h1>

      {orders.map((o) => (
        <div key={o.id} className="bg-white p-4 rounded shadow">
          <p>Seller: {o.sellerId}</p>
          <p>Amount: {o.sellerAmount} RWF</p>

          <button
            onClick={() => markPaid(o.id)}
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            ✅ Mark as Paid
          </button>
        </div>
      ))}

      {orders.length === 0 && (
        <p className="text-gray-500">No pending payouts</p>
      )}
    </main>
  );
}