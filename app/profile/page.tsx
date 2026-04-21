"use client";

import { useState } from "react";
import { uploadImage } from "../../lib/upload";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [photo, setPhoto] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // 🔹 Handle Image Upload
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const url = await uploadImage(file);
      setPhoto(url);
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Save Profile to Firestore
  const saveProfile = async () => {
    if (!name || !email) {
      alert("Name and Email are required");
      return;
    }

    try {
      await setDoc(doc(db, "users", email || name), {
  name,
  phone,
  email,
  photo,
  role: "patient", // or technician later
  district: "Kigali",
  online: true,
  createdAt: Date.now(),
});

      alert("Profile saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save profile");
    }
  };

  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <div className="max-w-md mx-auto bg-[#202c33] rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          My Profile
        </h1>

        <div className="flex flex-col gap-4 items-center">
          {/* 🔹 Profile Image */}
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-green-500"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-sm">
              No Image
            </div>
          )}

          {/* 🔹 Upload Button */}
          <label className="bg-green-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition">
            {loading ? "Uploading..." : "Upload Photo"}
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleUpload}
            />
          </label>

          {/* 🔹 Inputs */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-2 rounded bg-[#2a3942] outline-none"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full px-4 py-2 rounded bg-[#2a3942] outline-none"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 rounded bg-[#2a3942] outline-none"
          />

          {/* 🔹 Save Button */}
          <button
            onClick={saveProfile}
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Profile
          </button>
        </div>
      </div>
    </main>
  );
}