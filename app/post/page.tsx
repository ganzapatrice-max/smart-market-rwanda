"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "../../lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function PostPage() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");

  const [text, setText] = useState("");
  const [media, setMedia] = useState("");
  const [type, setType] = useState("normal");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);
      setName(currentUser.displayName || "User");
      setPhoto(currentUser.photoURL || "");
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // UPLOAD IMAGE / VIDEO CLOUDINARY
  //////////////////////////////////////////////////////
  const uploadFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg("Uploading file...");

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "quickfix");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dmebligcw/auto/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();

    setMedia(result.secure_url);
    setMsg("✅ Upload complete");
  };

  //////////////////////////////////////////////////////
  // CREATE POST
  //////////////////////////////////////////////////////
  const createPost = async () => {
    if (!text && !media) return;

    try {
      setLoading(true);
      setMsg("");

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        email: user.email,
        name,
        photo,
        text,
        media,
        type,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
      });

      setText("");
      setMedia("");
      setType("normal");

      setMsg("✅ Post Published Successfully");
    } catch (error) {
      setMsg("❌ Failed to publish");
    }

    setLoading(false);
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#07111a] text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* TOP */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Create Post
          </h1>

          <Link
            href="/feed"
            className="bg-green-600 px-5 py-3 rounded-full"
          >
            Feed
          </Link>
        </div>

        {/* CARD */}
        <div className="bg-[#0f172a] rounded-3xl p-6">

          {/* USER */}
          <div className="flex items-center gap-4 mb-6">

            <img
              src={photo || "/default-avatar.png"}
              className="w-14 h-14 rounded-full object-cover"
            />

            <div>
              <h2 className="font-bold text-lg">
                {name}
              </h2>

              <p className="text-gray-400 text-sm">
                {user?.email}
              </p>
            </div>
          </div>

          {msg && (
            <div className="mb-4 bg-green-700 p-3 rounded-xl">
              {msg}
            </div>
          )}

          {/* TYPE */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#1e293b] mb-4"
          >
            <option value="normal">Text Update</option>
            <option value="service">Service Promotion</option>
            <option value="product">Product For Sale</option>
            <option value="job">Job Request</option>
            <option value="video">Short Video</option>
          </select>

          {/* TEXT */}
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 rounded-xl bg-[#1e293b]"
          />

          {/* FILE */}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={uploadFile}
            className="w-full mt-4 p-4 rounded-xl bg-[#1e293b]"
          />

          {/* PREVIEW IMAGE */}
          {media && (
            <div className="mt-4">
              {media.includes(".mp4") ? (
                <video
                  src={media}
                  controls
                  className="rounded-2xl w-full"
                />
              ) : (
                <img
                  src={media}
                  className="rounded-2xl w-full"
                />
              )}
            </div>
          )}

          {/* BUTTONS */}
          <div className="grid grid-cols-2 gap-4 mt-6">

            <button
              onClick={createPost}
              disabled={loading}
              className="bg-blue-600 py-4 rounded-full font-bold"
            >
              {loading ? "Posting..." : "Publish Post"}
            </button>

            <Link
              href="/feed"
              className="bg-purple-600 text-center py-4 rounded-full font-bold"
            >
              Open Feed
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}