"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD ORDERS (SELLER SIDE)
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("sellerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setOrders(data);
    });

    return () => unsub();
  }, [user]);

  //////////////////////////////////////////////////////
  // CONFIRM PAYMENT
  //////////////////////////////////////////////////////
  const confirmOrder = async (id: string) => {
    await updateDoc(doc(db, "orders", id), {
      status: "confirmed",
    });

    alert("✅ Payment confirmed!");
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">💼 Seller Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">No orders yet</p>
      )}

      {orders.map((o) => (
        <div key={o.id} className="bg-white p-4 rounded shadow">
          <p><b>Amount:</b> {o.amount} RWF</p>
          <p><b>Status:</b> {o.status}</p>

          {o.status === "pending" && (
            <button
              onClick={() => confirmOrder(o.id)}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
            >
              ✅ Confirm Payment
            </button>
          )}
        </div>
      ))}
    </main>
  );
}