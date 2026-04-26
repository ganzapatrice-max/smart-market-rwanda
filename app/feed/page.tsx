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
} from "firebase/firestore";

export default function FeedPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [usersMap, setUsersMap] = useState<any>({});
  const [filter, setFilter] = useState("all");

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
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPosts(arr);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // USERS MAP
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!posts.length) return;

    const loadUsers = async () => {
      const newMap: any = {};

      await Promise.all(
        posts.map(async (post) => {
          if (!newMap[post.userId]) {
            const snap = await getDoc(doc(db, "users", post.userId));
            if (snap.exists()) {
              newMap[post.userId] = snap.data();
            }
          }
        })
      );

      setUsersMap(newMap);
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
  // FILTER
  //////////////////////////////////////////////////////
  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    return post.type === filter;
  });

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="w-full">

      {/* CREATE POST */}
      <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
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
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
            onClick={() => router.push("/post")}
            readOnly
          />
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
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
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const userData = usersMap[post.userId];

          return (
            <div key={post.id} className="bg-white rounded-xl shadow-sm p-4">

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
                    {/* ✅ FORCE USER NAME VISIBILITY */}
                    <p className="font-semibold text-sm text-black">
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

              {/* ✅ FORCE POST TEXT VISIBILITY */}
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
                <span>💬</span>
                <span>↗ {post.shares || 0}</span>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-around border-t mt-3 pt-2 text-sm text-gray-600">
                <button onClick={() => likePost(post.id)}>👍 Like</button>
                <button>💬 Comment</button>
                <button>↗ Share</button>
              </div>

              {/* COMMENTS */}
              <Comments postId={post.id} postOwnerId={post.userId} />

            </div>
          );
        })}
      </div>
    </main>
  );
}