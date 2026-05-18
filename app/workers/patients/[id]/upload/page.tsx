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
  // HANDLE FILE
  //////////////////////////////////////////////////////
  const handleFile = (file: File) => {
    setFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  //////////////////////////////////////////////////////
  // CLOUDINARY UPLOAD
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
  // EDIT DESCRIPTION
  //////////////////////////////////////////////////////
  const editDescription = async (index: number) => {
    const newDesc = prompt("Edit description", user.photos[index].description);
    if (!newDesc) return;

    const updated = [...user.photos];
    updated[index].description = newDesc;

    await updateDoc(doc(db, "workers", id as string), {
      photos: updated,
    });

    setUser({ ...user, photos: updated });
  };

  if (!user) return <p className="text-white p-6">Loading...</p>;

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-black text-white pb-24 p-5">

      <h1 className="text-xl font-bold text-center mb-6">
        📸 Upload Problem Photo
      </h1>

      {/* PREVIEW */}
      {preview && (
        <img
          src={preview}
          className="w-full max-w-sm mx-auto h-64 object-cover rounded-xl mb-4"
        />
      )}

      {/* DESCRIPTION */}
      <input
        type="text"
        placeholder="Describe the problem..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-3 rounded-xl text-black mb-4"
      />

      {/* BUTTONS */}
      <div className="grid grid-cols-3 gap-3 mb-6">

        {/* TAKE PHOTO */}
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

        {/* CHOOSE PHOTO */}
        <label className="bg-purple-600 p-3 rounded-xl text-center cursor-pointer">
          🖼 Choose
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            hidden
          />
        </label>

        {/* SAVE */}
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
                onClick={() => editDescription(i)}
                className="bg-yellow-500 px-2 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => deletePhoto(i)}
                className="bg-red-600 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b1f3a] flex justify-around py-4 border-t border-white/10">

        <Link href="/" className="text-center">🏠<br/>Home</Link>
        <Link href="/post" className="text-center">➕<br/>Post</Link>
        <Link href="/feed" className="text-center">📰<br/>Feed</Link>
        <Link href="/workers/technicians" className="text-center">🛠<br/>Service</Link>

      </div>

    </main>
  );
}