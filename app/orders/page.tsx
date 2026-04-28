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
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

type Order = {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: string;
};

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);

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
      const data: Order[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, "id">),
      }));

      setOrders(data);
    });

    return () => unsub();
  }, [user]);

  //////////////////////////////////////////////////////
  // CONFIRM PAYMENT + NOTIFICATIONS 🔥
  //////////////////////////////////////////////////////
  const confirmOrder = async (order: Order) => {
    // ✅ update order
    await updateDoc(doc(db, "orders", order.id), {
      status: "confirmed",
    });

    // 🔔 notify buyer
    await addDoc(collection(db, "notifications"), {
      toUserId: order.buyerId,
      fromUserId: order.sellerId,
      type: "payment_confirmed",
      createdAt: serverTimestamp(),
      read: false,
    });

    // 🔔 notify seller (you)
    await addDoc(collection(db, "notifications"), {
      toUserId: order.sellerId,
      fromUserId: order.buyerId,
      type: "payment_received",
      createdAt: serverTimestamp(),
      read: false,
    });

    alert("✅ Payment confirmed & notifications sent!");
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
              onClick={() => confirmOrder(o)}
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