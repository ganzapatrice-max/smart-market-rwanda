"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
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

  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // AUTH
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
  // PHOTO UPLOAD
  //////////////////////////////////////////////////////

  const uploadPhotos = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);

    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        const data = new FormData();

        data.append("file", file);
        data.append("upload_preset", "quickfix");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dmebligcw/image/upload",
          {
            method: "POST",
            body: data,
          }
        );

        const result = await res.json();

        if (result.secure_url) {
          uploaded.push(result.secure_url);
        }
      }

      setPhotos(uploaded);
    } catch (err) {
      console.error(err);
      alert("Failed to upload photos.");
    }

    setUploading(false);
  };

  //////////////////////////////////////////////////////
  // CREATE SERVICE
  //////////////////////////////////////////////////////

  const createService = async () => {
    if (!user) return;

    if (!title || !description || !price) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "services"), {
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category: category || "General",
        location,
        phone,
        photos,
        createdAt: serverTimestamp(),
      });

      alert("✅ Service created successfully!");

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

        <h1 className="text-3xl font-bold mb-6">
          🛠 Create Service
        </h1>

        <input
          placeholder="Service Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        <textarea
          placeholder="Describe the problem or service"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        <input
          type="number"
          placeholder="Price (RWF)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-200 text-black"
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-200 text-black"
        />

        <div className="mb-4">
          <label className="font-semibold block mb-2">
            📷 Add Photos of the Problem
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={uploadPhotos}
            className="w-full bg-gray-200 text-black rounded p-2"
          />

          {uploading && (
            <p className="text-green-400 mt-2">
              Uploading photos...
            </p>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Problem ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={createService}
          disabled={loading || uploading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 p-3 rounded-lg font-bold"
        >
          {loading ? "Creating Service..." : "🚀 Post Service"}
        </button>

      </div>
    </main>
  );
}