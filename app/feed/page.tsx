"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function FeedPage() {
  const [user, setUser] = useState<any>(null);
  const [text, setText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // LOGIN
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD POSTS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(data);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // CREATE POST
  //////////////////////////////////////////////////////
  const createPost = async () => {
    if (!user) {
      alert("Login first");
      return;
    }

    if (!text.trim()) {
      alert("Write something");
      return;
    }

    await addDoc(collection(db, "posts"), {
      userId: user.uid,
      name: user.displayName || "User",
      text,
      likes: 0,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-black text-white p-5">

      <h1 className="text-3xl font-bold mb-5">
        📱 Community Feed
      </h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's happening?"
        className="w-full p-4 rounded-xl text-black mb-4"
      />

      <button
        onClick={createPost}
        className="w-full bg-blue-600 p-4 rounded-xl font-bold mb-6"
      >
        Post Now
      </button>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-[#111827] p-5 rounded-2xl"
          >
            <p className="font-bold">
              {post.name}
            </p>

            <p className="mt-2">
              {post.text}
            </p>

            <p className="text-gray-400 mt-3 text-sm">
              ❤️ {post.likes}
            </p>
          </div>
        ))}
      </div>

    </main>
  );
}