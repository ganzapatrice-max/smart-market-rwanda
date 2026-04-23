"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  const createService = async () => {
    if (!user) return;

    await addDoc(collection(db, "services"), {
      userId: user.uid,
      title,
      description,
      price: Number(price),
      category,
      location,
      phone,
      createdAt: serverTimestamp(),
    });

    alert("Service posted!");
    router.push("/services");
  };

  return (
    <main className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create Service</h1>

      <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} className="w-full mb-3 p-3 text-white" />
      <textarea placeholder="Description" onChange={(e) => setDescription(e.target.value)} className="w-full mb-3 p-3 text-white" />
      <input placeholder="Price" onChange={(e) => setPrice(e.target.value)} className="w-full mb-3 p-3 text-white" />
      <input placeholder="Category" onChange={(e) => setCategory(e.target.value)} className="w-full mb-3 p-3 text-white" />
      <input placeholder="Location" onChange={(e) => setLocation(e.target.value)} className="w-full mb-3 p-3 text-whit" />
      <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} className="w-full mb-3 p-3 text-white" />

      <button onClick={createService} className="bg-green-600 px-4 py-2 rounded">
        Post Service
      </button>
    </main>
  );
}