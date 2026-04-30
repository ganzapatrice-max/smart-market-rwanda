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
  const [proof, setProof] = useState<string | null>(null); // ✅ NEW

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

      try {
        let snap = await getDoc(doc(db, "services", id as string));

        if (!snap.exists()) {
          snap = await getDoc(doc(db, "posts", id as string));
        }

        if (snap.exists()) {
          setProduct(snap.data());
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

    // ❌ require proof (ANTI-FRAUD)
    if (!proof) {
      alert("Please upload payment proof");
      return;
    }

    const price = product.price || 0;
    const platformFee = price * 0.1;
    const sellerAmount = price - platformFee;

    const orderRef = await addDoc(collection(db, "orders"), {
      buyerId: user.uid,
      sellerId: product.userId,
      productId: id,
      amount: price,
      platformFee,
      sellerAmount,
      proofImage: proof, // ✅ NEW
      status: "pending_verification", // ✅ UPDATED
      payoutStatus: "pending",
      createdAt: serverTimestamp(),
    });

    // 💰 SAVE YOUR EARNING
    await addDoc(collection(db, "earnings"), {
      amount: platformFee,
      orderId: orderRef.id,
      createdAt: serverTimestamp(),
    });

    // 🔔 NOTIFY SELLER
    await addDoc(collection(db, "notifications"), {
      toUserId: product.userId,
      fromUserId: user.uid,
      type: "new_order",
      amount: price,
      orderId: orderRef.id,
      createdAt: serverTimestamp(),
      read: false,
    });

    alert("✅ Order sent! Waiting for seller confirmation.");

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

      {/* 📸 PAYMENT PROOF */}
      <div>
        <p className="text-sm mb-1">Upload payment proof</p>
        <input
          type="file"
          onChange={(e) =>
            setProof(URL.createObjectURL(e.target.files![0]))
          }
        />
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