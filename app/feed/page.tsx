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
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function FeedPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [usersMap, setUsersMap] = useState<any>({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // POSTS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // USERS MAP
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!posts.length) return;

    const loadUsers = async () => {
      const map: any = {};

      await Promise.all(
        posts.map(async (post) => {
          if (!map[post.userId]) {
            const snap = await getDoc(doc(db, "users", post.userId));
            if (snap.exists()) {
              map[post.userId] = snap.data();
            }
          }
        })
      );

      setUsersMap(map);
    };

    loadUsers();
  }, [posts]);

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
  // SHARE
  //////////////////////////////////////////////////////
  const sharePost = async (post: any) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "posts", post.id), {
        shares: increment(1),
      });

      if (post.userId !== user.uid) {
        await addDoc(collection(db, "notifications"), {
          toUserId: post.userId,
          fromUserId: user.uid,
          type: "share",
          postId: post.id,
          createdAt: serverTimestamp(),
          read: false,
        });
      }

      if (navigator.share) {
        await navigator.share({
          title: "Smart Market",
          text: post.text,
          url: window.location.href,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  //////////////////////////////////////////////////////
  // FILTER + SEARCH
  //////////////////////////////////////////////////////
  const filteredPosts = posts.filter((post) => {
    const matchType = filter === "all" || post.type === filter;

    const matchSearch =
      post.text?.toLowerCase().includes(search.toLowerCase()) ||
      usersMap[post.userId]?.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    return matchType && matchSearch;
  });

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="w-full space-y-4">

      {/* 🔍 SEARCH (FIXED VISIBILITY) */}
      <div className="bg-white p-3 rounded-xl shadow-sm">
        <input
          placeholder="Search posts or users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-100 text-black placeholder-gray-500 outline-none"
        />
      </div>

      {/* 🎥 REELS */}
      <div className="flex gap-3 overflow-x-auto">
        {posts
          .filter((p) => p.type === "video")
          .map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/reel/${post.id}`)}
              className="min-w-[100px] cursor-pointer"
            >
              <video
                src={post.media}
                className="h-32 w-full object-cover rounded-lg"
                muted
              />
              <p className="text-xs text-center text-black">
                {usersMap[post.userId]?.name || "User"}
              </p>
            </div>
          ))}
      </div>

      {/* CREATE POST (FIXED) */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex gap-3 items-center">
          <img
            src={
              (user && usersMap[user?.uid]?.photo) ||
              "/default-avatar.png"
            }
            className="w-10 h-10 rounded-full"
          />

          <input
            placeholder="What's on your mind?"
            onClick={() => router.push("/post")}
            readOnly
            className="flex-1 bg-gray-100 text-black px-4 py-2 rounded-full"
          />
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 overflow-x-auto">
        {["all", "normal", "image", "video", "service"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* POSTS */}
      {filteredPosts.map((post) => {
        const userData = usersMap[post.userId];

        return (
          <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm">

            {/* HEADER */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <img
                  src={
                    post.photo ||
                    userData?.photo ||
                    "/default-avatar.png"
                  }
                  className="w-10 h-10 rounded-full"
                />

                <div>
                  <p className="font-semibold text-black text-sm">
                    {userData?.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {post.type || "post"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <FollowButton targetUserId={post.userId} />

                <Link
                  href={`/profile/${post.userId}`}
                  className="text-blue-500 text-xs"
                >
                  View
                </Link>

                {user?.uid === post.userId && (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-red-500"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>

            {/* TEXT */}
            {post.text && (
              <p className="my-3 text-black font-medium">
                {post.text}
              </p>
            )}

            {/* MEDIA */}
            {post.media && (
              <div className="mt-2">
                {post.type === "video" ? (
                  <video
                    src={post.media}
                    controls
                    className="rounded-lg w-full"
                  />
                ) : (
                  <img
                    src={post.media}
                    className="rounded-lg w-full"
                  />
                )}
              </div>
            )}

            {/* COUNTS */}
            <div className="flex justify-between text-xs text-gray-500 mt-3">
              <span>👍 {post.likes || 0}</span>
              <span>↗ {post.shares || 0}</span>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-around border-t mt-3 pt-2 text-sm">
              <button onClick={() => likePost(post.id)}>👍 Like</button>
              <button>💬 Comment</button>
              <button onClick={() => sharePost(post)}>↗ Share</button>
            </div>

            {/* COMMENTS */}
            <Comments postId={post.id} postOwnerId={post.userId} />
          </div>
        );
      })}
    </main>
  );
}