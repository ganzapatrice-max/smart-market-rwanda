"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

export default function ProfilePosts({
  params,
}: {
  params: { id: string };
}) {
  const [posts, setPosts] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // LOAD POSTS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", params.id),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setPosts(arr);
    });

    return () => unsub();
  }, [params.id]);

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#07111a] text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Posts</h1>
        </div>

        {/* POSTS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#0f172a] rounded-2xl overflow-hidden hover:scale-105 transition"
            >
              {/* MEDIA */}
              {post.media ? (
                post.type === "video" ? (
                  <video
                    src={post.media}
                    className="w-full h-56 object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={post.media}
                    className="w-full h-56 object-cover"
                  />
                )
              ) : (
                <div className="p-4">
                  <p className="text-sm">{post.text}</p>
                </div>
              )}

              {/* FOOTER */}
              <div className="p-3 text-xs text-gray-400">
                ❤️ {post.likes || 0} • 💬 {post.comments || 0}
              </div>
            </div>
          ))}

        </div>

        {/* EMPTY STATE */}
        {posts.length === 0 && (
          <div className="text-center mt-10 text-gray-400">
            No posts yet
          </div>
        )}

      </div>
    </main>
  );
}