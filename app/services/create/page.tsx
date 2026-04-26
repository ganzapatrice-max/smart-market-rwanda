"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc } from "firebase/firestore";

// AFTER saving to "services"
await addDoc(collection(db, "posts"), {
  userId: user.uid,
  text: title + " - " + description,
  media: "",
  type: "service",
  price,
  location,
  phone,
  createdAt: serverTimestamp(),
});
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CreateService() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // AUTH CHECK
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
      }
    });

    return () => unsub();
  }, [router]);

  //////////////////////////////////////////////////////
  // CREATE SERVICE
  //////////////////////////////////////////////////////
  const createService = async () => {
    if (!user) return;

    if (!title || !description || !price) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "services"), {
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category: category || "general",
        location: location || "",
        phone: phone || "",

        // 🔗 IMPORTANT FOR FEED LINKING
        type: "service",

        createdAt: serverTimestamp(),
      });

      alert("✅ Service posted successfully!");

      router.push("/services");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-xl mx-auto bg-[#111827] p-6 rounded-2xl shadow">

        <h1 className="text-2xl font-bold mb-6">
          🛠 Create Service
        </h1>

        {/* TITLE */}
        <input
          placeholder="Service Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        {/* DESCRIPTION */}
        <textarea
          placeholder="Service Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        {/* PRICE */}
        <input
          placeholder="Price (RWF)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        {/* CATEGORY */}
        <input
          placeholder="Category (e.g. Cleaning, Repair...)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        {/* LOCATION */}
        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        {/* PHONE */}
        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-200 text-black"
        />

        {/* BUTTON */}
        <button
          onClick={createService}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded font-bold"
        >
          {loading ? "Posting..." : "Post Service"}
        </button>
      </div>
    </main>
  );
}