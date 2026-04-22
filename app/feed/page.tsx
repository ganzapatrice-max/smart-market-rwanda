"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { auth, db } from "@/lib/firebase";
import Comments from "@/app/components/Comments";
import FollowButton from "@/app/components/FollowButton";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  increment,
} from "firebase/firestore";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  //////////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
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
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPosts(arr);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LIKE
  //////////////////////////////////////////////////////
  const likePost = async (id: string) => {
    try {
      await updateDoc(doc(db, "posts", id), {
        likes: increment(1),
      });
    } catch (err) {
      console.error(err);
    }
  };

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////
  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;

    try {
      await deleteDoc(doc(db, "posts", id));
    } catch (err) {
      console.error(err);
    }
  };

  //////////////////////////////////////////////////////
  // TIME AGO
  //////////////////////////////////////////////////////
  const timeAgo = (date: any) => {
    if (!date?.seconds) return "Now";

    const diff = Math.floor((Date.now() - date.seconds * 1000) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return `${Math.floor(diff / 86400)}d`;
  };

  //////////////////////////////////////////////////////
  // SHARE
  //////////////////////////////////////////////////////
  const sharePost = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Smart Market Rwanda",
          url: window.location.href,
        });
      }
    } catch (err) {
      console.log("Share cancelled");
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#07111a] text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* TOP */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Smart Feed</h1>

          <Link
            href="/post"
            className="bg-green-600 px-5 py-2 rounded-full font-bold hover:bg-green-700"
          >
            ➕ Post
          </Link>
        </div>

        {/* REELS */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-3">🎬 Reels</h2>

          <div className="flex gap-4 overflow-x-auto">
            {posts
              .filter((p) => p.type === "video")
              .map((post) => (
                <video
                  key={post.id}
                  src={post.media}
                  className="h-56 w-40 object-cover rounded-2xl"
                  controls
                />
              ))}
          </div>
        </div>

        {/* POSTS */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#0f172a] rounded-2xl p-5 shadow-lg"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">

                <div className="flex items-center gap-3">
                  <img
                    src={post.photo || "/default-avatar.png"}
                    className="w-12 h-12 rounded-full"
                  />

                  <div>
                    <h2 className="font-semibold">
                      {post.name || "User"}
                    </h2>

                    <p className="text-xs text-gray-400">
                      {timeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FollowButton targetUserId={post.userId} />

                  <Link
                    href={`/profile/${post.userId}`}
                    className="text-xs text-blue-400"
                  >
                    View
                  </Link>

                  {user?.uid === post.userId && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-500 text-sm"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>

              {/* TEXT */}
              {post.text && (
                <p className="my-4 text-[15px]">{post.text}</p>
              )}

              {/* MEDIA */}
              {post.media && (
                <div className="mt-3">
                  {post.type === "video" ? (
                    <video
                      src={post.media}
                      controls
                      className="rounded-xl w-full"
                    />
                  ) : (
                    <img
                      src={post.media}
                      className="rounded-xl w-full"
                    />
                  )}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex justify-between mt-4 text-sm">

                <button
                  onClick={() => likePost(post.id)}
                  className="flex items-center gap-1 text-red-400"
                >
                  ❤️ {post.likes || 0}
                </button>

                <span className="text-blue-400">
                  💬 {post.comments || 0}
                </span>

                <button
                  onClick={sharePost}
                  className="text-green-400"
                >
                  🔁 Share
                </button>
              </div>

              {/* COMMENTS */}
              <Comments postId={post.id} />

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}