"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD PRODUCT
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      let snap = await getDoc(doc(db, "services", id as string));

      if (!snap.exists()) {
        snap = await getDoc(doc(db, "posts", id as string));
      }

      if (snap.exists()) {
        setProduct(snap.data());
      }
    };

    load();
  }, [id]);

  //////////////////////////////////////////////////////
  // 💰 MOMO PAYMENT
  //////////////////////////////////////////////////////
  const payWithMoMo = async () => {
    if (!user || !product) return;

    if (user.uid === product.userId) {
      alert("You cannot buy your own product");
      return;
    }

    setLoading(true);

    try {
      // 👉 call your backend
      const res = await fetch("/api/momo-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: product.price,
          phone: "250780000000", // 🔥 replace with real user phone later
          productId: id,
          sellerId: product.userId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("❌ Payment request failed");
        setLoading(false);
        return;
      }

      const referenceId = data.referenceId;

      // 🧾 CREATE ORDER (pending)
      const orderRef = await addDoc(collection(db, "orders"), {
        buyerId: user.uid,
        sellerId: product.userId,
        productId: id,
        amount: product.price,
        momoReferenceId: referenceId,
        status: "pending_payment",
        createdAt: serverTimestamp(),
      });

      alert("📱 Payment request sent! Check your phone.");

      router.push("/orders");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  if (!product)
    return <p className="p-4">❌ Product not found...</p>;

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">

      <h1 className="text-xl font-bold">💳 Checkout</h1>

      <div className="bg-white p-4 rounded shadow">
        <p className="font-semibold text-black">
          {product.title || "Service"}
        </p>
        <p className="text-gray-500">
          {product.price || 0} RWF
        </p>
      </div>

      {/* ✅ NEW REAL PAYMENT */}
      <div className="bg-green-100 p-4 rounded">
        <p className="font-semibold">Pay with MTN MoMo</p>
        <p>Click below and confirm on your phone 📱</p>
      </div>

      <button
        onClick={payWithMoMo}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded"
      >
        {loading ? "Processing..." : "💰 Pay Now"}
      </button>

    </main>
  );
}