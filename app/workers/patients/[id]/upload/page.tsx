"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "workers", id as string));
      if (snap.exists()) setUser(snap.data());
    };
    load();
  }, [id]);

  //////////////////////////////////////////////////////
  // COMPRESS IMAGE (🔥 PERFORMANCE BOOST)
  //////////////////////////////////////////////////////
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 800;

        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          }
        }, "image/jpeg", 0.7);
      };

      reader.readAsDataURL(file);
    });
  };

  //////////////////////////////////////////////////////
  // HANDLE FILE
  //////////////////////////////////////////////////////
  const handleFile = async (selected: File) => {
    const compressed = await compressImage(selected);

    setFile(compressed);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(compressed);
  };

  //////////////////////////////////////////////////////
  // CLOUDINARY
  //////////////////////////////////////////////////////
  const uploadToCloudinary = async () => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "quickfix");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dmebligcw/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  //////////////////////////////////////////////////////
  // SAVE
  //////////////////////////////////////////////////////
  const savePhoto = async () => {
    try {
      if (!file) return alert("Select photo");
      if (!description) return alert("Write description");

      setLoading(true);

      const url = await uploadToCloudinary();

      const updated = [
        ...(user.photos || []),
        { url, description },
      ];

      await updateDoc(doc(db, "workers", id as string), {
        photos: updated,
      });

      setUser({ ...user, photos: updated });
      setFile(null);
      setPreview(null);
      setDescription("");

      alert("Uploaded ✅");

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////
  const deletePhoto = async (index: number) => {
    const updated = user.photos.filter((_: any, i: number) => i !== index);

    await updateDoc(doc(db, "workers", id as string), {
      photos: updated,
    });

    setUser({ ...user, photos: updated });
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  if (!user) return <p className="text-white p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-black text-white pb-24 p-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => router.back()}
          className="bg-white/10 px-3 py-2 rounded-xl"
        >
          ← Back
        </button>

        <h1 className="font-bold">Upload Photo</h1>

        <div />
      </div>

      {/* PREVIEW + DESCRIPTION */}
      {preview && (
        <div className="mb-4">

          <img
            src={preview}
            className="w-full h-64 object-cover rounded-xl"
          />

          <textarea
            placeholder="Describe the problem..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl text-white"
          />

        </div>
      )}

      {/* BUTTONS */}
      <div className="grid grid-cols-3 gap-3 mb-6">

        <label className="bg-green-600 p-3 rounded-xl text-center cursor-pointer">
          📷 Take
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            hidden
          />
        </label>

        <label className="bg-purple-600 p-3 rounded-xl text-center cursor-pointer">
          🖼 Choose
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            hidden
          />
        </label>

        <button
          onClick={savePhoto}
          disabled={loading}
          className="bg-blue-600 p-3 rounded-xl"
        >
          {loading ? "..." : "💾 Save"}
        </button>
      </div>

      {/* EXISTING PHOTOS */}
      <div className="grid grid-cols-2 gap-4">
        {user.photos?.map((p: any, i: number) => (
          <div key={i} className="bg-white/10 p-2 rounded-xl">

            <img
              src={p.url}
              className="w-full h-40 object-cover rounded-lg mb-2"
            />

            <p className="text-sm mb-2">{p.description}</p>

            <div className="flex gap-2">

              <button
                onClick={() => deletePhoto(i)}
                className="bg-red-600 px-2 py-1 rounded text-xs"
              >
                🗑 Delete
              </button>

              <button
                onClick={() => alert("Crop tool next upgrade")}
                className="bg-blue-500 px-2 py-1 rounded text-xs"
              >
                ✂ Crop
              </button>

            </div>

          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b1f3a] flex justify-around py-4 border-t border-white/10">

        <Link href="/">🏠<br/>Home</Link>
        <Link href="/post">➕<br/>Post</Link>
        <Link href="/feed">📰<br/>Feed</Link>
        <Link href="/workers/technicians">🛠<br/>Service</Link>

      </div>

    </main>
  );
}