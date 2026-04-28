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

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD PRODUCT (✅ FIXED HERE)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        // ✅ FIRST: try services
        let snap = await getDoc(doc(db, "services", id as string));

        // ✅ FALLBACK: try posts
        if (!snap.exists()) {
          snap = await getDoc(doc(db, "posts", id as string));
        }

        if (snap.exists()) {
          setProduct(snap.data());
        } else {
          console.log("❌ Product not found");
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [id]);

  //////////////////////////////////////////////////////
  // CONFIRM PAYMENT
  //////////////////////////////////////////////////////
  const confirmPayment = async () => {
  if (!user || !product) return;

  // ❌ block self-buy
  if (user.uid === product.userId) {
    alert("You cannot buy your own product");
    return;
  }

  // 💰 PLATFORM LOGIC
  const price = product.price || 0;
  const platformFee = price * 0.1; // 10% for you
  const sellerAmount = price - platformFee;

  const orderRef = await addDoc(collection(db, "orders"), {
    buyerId: user.uid,
    sellerId: product.userId,
    productId: id,
    amount: price,
    platformFee,
    sellerAmount,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  // 💸 SAVE YOUR EARNING
  await addDoc(collection(db, "earnings"), {
    amount: platformFee,
    orderId: orderRef.id,
    createdAt: serverTimestamp(),
  });

  alert("✅ Order created! Seller will confirm payment.");

  router.push("/");
};


  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  if (!product)
    return <p className="p-4">❌ Product not found or loading...</p>;

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

      {/* 💰 PAYMENT */}
      <div className="bg-yellow-100 p-4 rounded">
        <p className="font-semibold">Pay via Mobile Money</p>
        <p>Send to: <b>078XXXXXXX</b></p>
        <p>Name: Smart Market Rwanda</p>
      </div>

      <button
        onClick={confirmPayment}
        className="w-full bg-green-600 text-white py-3 rounded"
      >
        ✅ I Have Paid
      </button>
    </main>
  );
}