"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
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
      where("userId", "==", params.id)
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

      <h1 className="text-2xl font-bold mb-6">
        User Posts
      </h1>

      <div className="grid md:grid-cols-3 gap-4">

        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-[#0f172a] rounded-xl p-3"
          >
            {post.media ? (
              post.type === "video" ? (
                <video
                  src={post.media}
                  className="rounded-xl w-full"
                  controls
                />
              ) : (
                <img
                  src={post.media}
                  className="rounded-xl w-full"
                />
              )
            ) : (
              <p>{post.text}</p>
            )}
          </div>
        ))}

      </div>
    </main>
  );
}