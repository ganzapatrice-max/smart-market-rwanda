"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "../../lib/firebase";

import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function PostPage() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [role, setRole] = useState("patient");

  const [text, setText] = useState("");
  const [media, setMedia] = useState("");
  const [type, setType] = useState("normal");

  const [autoPlay, setAutoPlay] = useState(true);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  //////////////////////////////////////////////////////
  // REAL-TIME USER PROFILE ✅ FIXED
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);

      // ✅ REAL-TIME LISTENER
      const ref = doc(db, "workers", currentUser.uid);

      const unsubProfile = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          setName(data?.name || "");
          setRole(data?.role || "patient");
          setPhoto(data?.photo || "");
        }
      });

      return () => unsubProfile();
    });

    return () => unsubAuth();
  }, []);

  //////////////////////////////////////////////////////
  // UPLOAD FILE
  //////////////////////////////////////////////////////
  const uploadFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg("Uploading...");

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
    setMsg("✅ Upload done");
  };

  //////////////////////////////////////////////////////
  // CREATE POST
  //////////////////////////////////////////////////////
  const createPost = async () => {
    if (!text && !media) return;
    if (!user) return;

    try {
      setLoading(true);
      setMsg("");

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        email: user.email,

        // ✅ ALWAYS CURRENT DATA
        name: name,
        photo: photo,
        role: role,

        text,
        media,
        type,

        autoPlay, // ✅ SAVE AUTOPLAY PREFERENCE

        likes: 0,
        comments: 0,
        shares: 0,

        createdAt: serverTimestamp(),
      });

      setText("");
      setMedia("");
      setType("normal");

      setMsg("✅ Posted");
    } catch (error) {
      console.error(error);
      setMsg("❌ Failed");
    }

    setLoading(false);
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#07111a] text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create Post</h1>

          <Link href="/feed" className="bg-green-600 px-5 py-3 rounded-full">
            Feed
          </Link>
        </div>

        <div className="bg-[#0f172a] rounded-3xl p-6">

          {/* USER */}
          <div className="flex items-center gap-4 mb-6">
            {photo ? (
              <img
                src={photo}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center">
                👤
              </div>
            )}

            <div>
              <h2 className="font-bold text-lg">{name || "..."}</h2>
              <p className="text-gray-400 text-sm">
                {user?.email} • {role}
              </p>
            </div>
          </div>

          {msg && (
            <div className="mb-4 bg-green-700 p-3 rounded-xl">{msg}</div>
          )}

          {/* TYPE */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#1e293b] mb-4"
          >
            <option value="normal">Text</option>
            <option value="service">Service</option>
            <option value="product">Product</option>
            <option value="job">Job</option>
            <option value="video">Video</option>
          </select>

          {/* TEXT */}
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write something..."
            className="w-full p-4 rounded-xl bg-[#1e293b]"
          />

          {/* FILE */}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={uploadFile}
            className="w-full mt-4 p-4 rounded-xl bg-[#1e293b]"
          />

          {/* PREVIEW */}
          {media && (
            <div className="mt-4">
              {media.includes(".mp4") ? (
                <video
                  src={media}
                  controls={!autoPlay}
                  autoPlay={autoPlay}
                  muted
                  loop
                  className="rounded-2xl w-full"
                />
              ) : (
                <img src={media} className="rounded-2xl w-full" />
              )}
            </div>
          )}

          {/* AUTOPLAY TOGGLE */}
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded"
          >
            {autoPlay ? "Auto Play ON" : "Auto Play OFF"}
          </button>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={createPost}
              disabled={loading}
              className="bg-blue-600 py-4 rounded-full font-bold"
            >
              {loading ? "Posting..." : "Publish"}
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