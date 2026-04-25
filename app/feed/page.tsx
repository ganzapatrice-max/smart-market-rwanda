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
  // LOAD USERS (PROFILE LINK FIX)
  //////////////////////////////////////////////////////
  useEffect(() => {
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
  // FILTER (KEEP SERVICES)
  //////////////////////////////////////////////////////
  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    return post.type === filter;
  });

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#f0f2f5] text-black">
      <div className="max-w-xl mx-auto py-4">

        {/* CREATE POST */}
        <div className="bg-white p-4 rounded-xl mb-4 shadow">
          <div className="flex gap-3 items-center">
            <img
              src={
                usersMap[user?.uid]?.photo ||
                "/default-avatar.png"
              }
              className="w-10 h-10 rounded-full"
            />

            <input
              placeholder="What's on your mind?"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2"
              onClick={() => router.push("/post")}
              readOnly
            />
          </div>
        </div>

        {/* REELS / STORIES */}
        <div className="flex gap-3 overflow-x-auto mb-4">
          {posts
            .filter((p) => p.type === "video")
            .map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/reel/${post.id}`)}
                className="min-w-[100px] cursor-pointer"
              >
                <div className="rounded-xl overflow-hidden">
                  <video
                    src={post.media}
                    className="h-32 w-full object-cover"
                    muted
                  />
                </div>
                <p className="text-xs text-center">
                  {usersMap[post.userId]?.name || "User"}
                </p>
              </div>
            ))}
        </div>

        {/* POSTS */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow p-4">

              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">

                  <img
                    src={
                      post.photo ||
                      usersMap[post.userId]?.photo ||
                      "/default-avatar.png"
                    }
                    className="w-10 h-10 rounded-full"
                  />

                  <div>
                    <p className="font-semibold text-sm">
                      {usersMap[post.userId]?.name || "User"}
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
                <p className="my-3 text-sm">{post.text}</p>
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
                <span>{post.comments || 0} comments</span>
                <span>{post.shares || 0} shares</span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-around border-t mt-2 pt-2 text-sm">
                <button onClick={() => likePost(post.id)}>👍 Like</button>
                <button>💬 Comment</button>
                <button>↗ Share</button>
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