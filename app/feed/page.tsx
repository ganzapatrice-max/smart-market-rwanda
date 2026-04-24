"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

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
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

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
    await updateDoc(doc(db, "posts", id), {
      likes: increment(1),
    });
  };

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////
  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "posts", id));
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
  // FILTER
  //////////////////////////////////////////////////////
  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    if (filter === "text") return post.type === "normal";
    if (filter === "photo") return post.type === "image";
    if (filter === "video") return post.type === "video";
    if (filter === "product") return post.type === "product";
    if (filter === "service") return post.type === "service";
    if (filter === "job") return post.type === "job";
    return true;
  });

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#07111a] text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* NAV */}
        <div className="flex gap-3 mb-4">
          <Link href="/" className="bg-gray-700 px-4 py-2 rounded">
            🏠 Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 px-4 py-2 rounded"
          >
            ⬅ Back
          </button>
        </div>

        {/* TOP */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Smart Feed</h1>

          <Link
            href="/post"
            className="bg-green-600 px-5 py-2 rounded-full font-bold"
          >
            ➕ Post
          </Link>
        </div>

        {/* SEARCH */}
        <div className="flex gap-2 mb-6">
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 rounded text-white"
          />
          <button
            onClick={() => router.push(`/search?q=${search}`)}
            className="bg-blue-600 px-4 rounded"
          >
            🔍
          </button>
        </div>

        {/* STORIES (SMALL CIRCLES) ✅ FIXED */}
        <div className="flex gap-4 overflow-x-auto mb-6">
          {posts
            .filter((p) => p.type === "video")
            .map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/reel/${post.id}`)}
                className="cursor-pointer flex flex-col items-center min-w-[70px]"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500">
                  <video
                    src={post.media}
                    className="w-full h-full object-cover"
                    muted
                  />
                </div>

                <span className="text-xs mt-1 truncate w-16 text-center">
                  {post.name}
                </span>
              </div>
            ))}
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 overflow-x-auto mb-6">
          {["all", "text", "photo", "video", "product", "service", "job"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full ${
                filter === f ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* POSTS */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-[#0f172a] rounded-2xl p-5">

              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src={post.photo || "/default-avatar.png"}
                    className="w-12 h-12 rounded-full"
                  />

                  <div>
                    <h2 className="font-semibold">{post.name || "User"}</h2>
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
                  className="text-red-400"
                >
                  ❤️ {post.likes || 0}
                </button>

                <span className="text-blue-400">
                  💬 {post.comments || 0}
                </span>
              </div>

              <Comments postId={post.id} />
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}