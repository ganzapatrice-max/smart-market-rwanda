"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const isStoryMode = searchParams.get("story") === "true";

  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [role, setRole] = useState("");

  const [text, setText] = useState("");
  const [media, setMedia] = useState("");
  const [type, setType] = useState("text");

  // 🔥 auto enable story if from stories
  const [isStory, setIsStory] = useState(isStoryMode);

  const [allowSound, setAllowSound] = useState(true);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  //////////////////////////////////////////////////////
  // USER REALTIME
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);

      const ref = doc(db, "workers", currentUser.uid);

      const unsubProfile = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setName(data?.name || "");
          setRole(data?.role || "");
          setPhoto(data?.photo || "");
        }
      });

      return () => unsubProfile();
    });

    return () => unsubAuth();
  }, []);

  //////////////////////////////////////////////////////
  // UPLOAD
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

    // 🔥 auto detect type
    if (result.secure_url.includes(".mp4")) {
      setType("video");
    } else {
      setType("image");
    }

    setMsg("✅ Uploaded");
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
        name,
        photo,
        role,

        text,
        media,
        type,

        // 🔥 STORY SYSTEM
        isStory,
        expiresAt: isStory
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,

        // 🔥 SOUND
        allowSound,

        // 🔥 COUNTS
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,

        createdAt: serverTimestamp(),
      });

      setText("");
      setMedia("");
      setType("text");
      setIsStory(false);

      setMsg("✅ Posted");
    } catch (err) {
      console.error(err);
      setMsg("❌ Failed");
    }

    setLoading(false);
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-3 rounded-xl sticky top-0 z-10">
          <h1 className="font-bold text-black">
            {isStory ? "Create Story" : "Create Post"}
          </h1>

          <Link
            href="/feed"
            className="bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            Feed
          </Link>
        </div>

        {/* CARD */}
        <div className="bg-white p-4 rounded-xl space-y-4">

          {/* USER */}
          <div className="flex gap-3 items-center">
            <img
              src={photo || "/default-avatar.png"}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-black">{name}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </div>

          {msg && <div className="text-green-600">{msg}</div>}

          {/* TYPE FILTER */}
          {!isStory && (
            <div className="flex gap-2 overflow-x-auto">
              {["text", "image", "video"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    type === t ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* TEXT */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isStory ? "Create a story..." : "What's on your mind?"
            }
            className="w-full p-3 bg-gray-100 rounded-lg text-black"
          />

          {/* FILE */}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={uploadFile}
            className="w-full"
          />

          {/* PREVIEW */}
          {media && (
            <div>
              {media.includes(".mp4") ? (
                <video
                  src={media}
                  autoPlay
                  controls
                  muted={!allowSound}
                  className="rounded-lg w-full"
                />
              ) : (
                <img src={media} className="rounded-lg w-full" />
              )}
            </div>
          )}

          {/* OPTIONS */}
          <div className="flex flex-wrap gap-3">

            {/* STORY TOGGLE */}
            <button
              onClick={() => setIsStory(!isStory)}
              className={`px-3 py-1 rounded-full text-sm ${
                isStory ? "bg-purple-600 text-white" : "bg-gray-200"
              }`}
            >
              {isStory ? "Story (24h)" : "Post"}
            </button>

            {/* SOUND */}
            <button
              onClick={() => setAllowSound(!allowSound)}
              className="px-3 py-1 bg-yellow-400 rounded-full text-sm"
            >
              {allowSound ? "Sound ON 🔊" : "Muted 🔇"}
            </button>
          </div>

          {/* ACTION */}
          <button
            onClick={createPost}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-full font-bold"
          >
            {loading ? "Posting..." : isStory ? "Publish Story" : "Publish"}
          </button>

        </div>
      </div>
    </main>
  );
}