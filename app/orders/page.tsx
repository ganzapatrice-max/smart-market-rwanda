"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    auth.onAuthStateChanged(setUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("buyerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, [user]);

  return (
    <main className="max-w-xl mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">📦 My Orders</h1>

      {orders.map((o) => (
        <div key={o.id} className="bg-white p-3 rounded shadow">
          <p>Amount: {o.amount} RWF</p>
          <p>Status: {o.status}</p>
        </div>
      ))}
    </main>
  );
}