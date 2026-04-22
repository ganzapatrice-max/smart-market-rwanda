"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // LOAD POSTS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];

      snap.forEach((docu) => {
        arr.push({
          id: docu.id,
          ...docu.data(),
        });
      });

      setPosts(arr);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LIKE
  //////////////////////////////////////////////////////
  const likePost = async (id: string) => {
    await updateDoc(doc(db, "posts", id), {
      likes: increment(1),
    });
  };

  //////////////////////////////////////////////////////
  // SHARE
  //////////////////////////////////////////////////////
  const sharePost = async () => {
    navigator.share?.({
      title: "Smart Market Rwanda",
      url: window.location.href,
    });
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
            Smart Feed
          </h1>

          <Link
            href="/post"
            className="bg-green-600 px-5 py-3 rounded-full"
          >
            Create Post
          </Link>
        </div>

        {/* POSTS */}
        <div className="space-y-6">

          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#0f172a] rounded-3xl p-6"
            >
              {/* USER */}
              <div className="flex items-center gap-4 mb-4">

                <img
                  src={
                    post.photo ||
                    "/default-avatar.png"
                  }
                  className="w-14 h-14 rounded-full object-cover"
                />

                <div>
                  <h2 className="font-bold text-lg">
                    {post.name}
                  </h2>

                  <p className="text-gray-400 text-sm">
                    {post.type}
                  </p>
                </div>
              </div>

              {/* TEXT */}
              {post.text && (
                <p className="mb-4 text-lg">
                  {post.text}
                </p>
              )}

              {/* MEDIA */}
              {post.media && (
                <>
                  {post.media.includes(".mp4") ? (
                    <video
                      src={post.media}
                      controls
                      className="rounded-2xl w-full"
                    />
                  ) : (
                    <img
                      src={post.media}
                      className="rounded-2xl w-full"
                    />
                  )}
                </>
              )}

              {/* ACTIONS */}
              <div className="grid grid-cols-3 gap-4 mt-6">

                <button
                  onClick={() => likePost(post.id)}
                  className="bg-red-600 py-3 rounded-full"
                >
                  ❤️ {post.likes || 0}
                </button>

                <button
                  className="bg-blue-600 py-3 rounded-full"
                >
                  💬 Comment
                </button>

                <button
                  onClick={sharePost}
                  className="bg-green-600 py-3 rounded-full"
                >
                  🔁 Share
                </button>

              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}