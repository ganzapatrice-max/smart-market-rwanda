"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    auth.onAuthStateChanged(setUser);
  }, []);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "posts", id as string));
      if (snap.exists()) setProduct(snap.data());
    };
    load();
  }, [id]);

  //////////////////////////////////////////////////////
  // CONFIRM PAYMENT (MANUAL MOMO)
  //////////////////////////////////////////////////////
  const confirmPayment = async () => {
    if (!user || !product) return;

    await addDoc(collection(db, "orders"), {
      buyerId: user.uid,
      sellerId: product.userId,
      productId: id,
      amount: product.price || 0,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    alert("Order created! Seller will confirm payment.");

    router.push("/");
  };

  if (!product) return <p>Loading...</p>;

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">

      <h1 className="text-xl font-bold">💳 Checkout</h1>

      <div className="bg-white p-4 rounded shadow">
        <p className="font-semibold">{product.title}</p>
        <p className="text-gray-500">{product.price} RWF</p>
      </div>

      {/* 💰 PAYMENT INSTRUCTIONS */}
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