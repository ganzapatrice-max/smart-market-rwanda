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
  const [filter, setFilter] = useState("all");
  const [usersMap, setUsersMap] = useState<any>({});

  //////////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
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
  // LOAD USERS (FIXED)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadUsers = async () => {
      const map: any = {};

      await Promise.all(
        posts.map(async (post) => {
          if (!map[post.userId]) {
            const ref = doc(db, "users", post.userId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              map[post.userId] = snap.data();
            }
          }
        })
      );

      setUsersMap(map);
    };

    if (posts.length) loadUsers();
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
    <main className="min-h-screen bg-[#07111a] text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* REELS (RESTORED ✅) */}
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

        {/* POSTS */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-[#0f172a] rounded-2xl p-5">

              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  
                  {/* ✅ ALWAYS LIVE PROFILE PHOTO */}
                  <img
                    src={
                      usersMap[post.userId]?.photo ||
                      "/default-avatar.png"
                    }
                    className="w-12 h-12 rounded-full"
                  />

                  <div>
                    <h2 className="font-semibold">
                      {usersMap[post.userId]?.name || "User"}
                    </h2>
                  </div>
                </div>

                {user?.uid === post.userId && (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-red-500"
                  >
                    🗑
                  </button>
                )}
              </div>

              {/* TEXT */}
              {post.text && (
                <p className="my-4">{post.text}</p>
              )}

              {/* MEDIA */}
              {post.media && (
                <div className="mt-3">
                  {post.type === "video" ? (
                    <video src={post.media} controls />
                  ) : (
                    <img src={post.media} />
                  )}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex justify-between mt-4">
                <button onClick={() => likePost(post.id)}>
                  ❤️ {post.likes || 0}
                </button>
              </div>

              <Comments postId={post.id} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}