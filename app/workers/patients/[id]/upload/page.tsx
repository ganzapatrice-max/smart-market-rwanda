"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

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
  const handleFile = (e: any) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selected);
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
  // SAVE PHOTO + DESCRIPTION
  //////////////////////////////////////////////////////
  const savePhoto = async () => {
    try {
      if (!file) return alert("Select photo");
      if (!description) return alert("Add description");

      setLoading(true);

      const url = await uploadToCloudinary();
      if (!url) return alert("Upload failed");

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
  // DELETE PHOTO
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
    <main className="min-h-screen bg-black text-white p-5">

      <h1 className="text-xl font-bold mb-6 text-center">
        📸 Manage Problem Photos
      </h1>

      {/* UPLOAD SECTION */}
      <div className="flex flex-col items-center">

        {preview && (
          <img
            src={preview}
            className="w-64 h-64 object-cover rounded-xl mb-3"
          />
        )}

        <input
          type="text"
          placeholder="Describe the problem..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full max-w-md p-3 rounded-xl text-black mb-3"
        />

        <label className="bg-green-600 px-6 py-3 rounded-xl cursor-pointer mb-3">
          📷 Take / Upload
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            hidden
          />
        </label>

        <button
          onClick={savePhoto}
          disabled={loading}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          {loading ? "Uploading..." : "Save"}
        </button>
      </div>

      {/* EXISTING PHOTOS */}
      <div className="mt-8 grid grid-cols-2 gap-4">

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

      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="mt-6 text-gray-400"
      >
        ← Back
      </button>

    </main>
  );
}