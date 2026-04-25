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

  // ✅ EDIT STATES
  const [editingPost, setEditingPost] = useState<any>(null);
  const [newText, setNewText] = useState("");
  const [newMedia, setNewMedia] = useState("");
  const [newPhoto, setNewPhoto] = useState("");

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
  // USERS (PROFILE DATA)
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
  // UPLOAD (Cloudinary)
  //////////////////////////////////////////////////////
  const uploadFile = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "quickfix");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dmebligcw/auto/upload",
      { method: "POST", body: data }
    );

    const result = await res.json();
    return result.secure_url;
  };

  //////////////////////////////////////////////////////
  // EDIT POST
  //////////////////////////////////////////////////////
  const openEdit = (post: any) => {
    setEditingPost(post);
    setNewText(post.text || "");
    setNewMedia(post.media || "");
    setNewPhoto(post.photo || "");
  };

  const saveEdit = async () => {
    if (!editingPost) return;

    await updateDoc(doc(db, "posts", editingPost.id), {
      text: newText,
      media: newMedia,
      photo: newPhoto,
    });

    setEditingPost(null);
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

        {/* REELS */}
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
                  {usersMap[post.userId]?.name || "User"}
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

                  {/* ✅ POST PHOTO FIRST */}
                  <img
                    src={
                      post.photo ||
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
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(post)}
                      className="text-yellow-400"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-500"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>

              {/* TEXT */}
              {post.text && <p className="my-4">{post.text}</p>}

              {/* MEDIA */}
              {post.media && (
                <div className="mt-3">
                  {post.type === "video" ? (
                    <video src={post.media} controls className="rounded-xl w-full" />
                  ) : (
                    <img src={post.media} className="rounded-xl w-full" />
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

        {/* ================= EDIT MODAL ================= */}
        {editingPost && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#0f172a] p-6 rounded-2xl w-full max-w-md">

              <h2 className="text-xl font-bold mb-4">Edit Post</h2>

              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full p-3 rounded bg-[#1e293b] mb-4"
              />

              {newMedia && (
                <div className="mb-4">
                  {newMedia.includes(".mp4") ? (
                    <video src={newMedia} controls />
                  ) : (
                    <img src={newMedia} />
                  )}
                </div>
              )}

              <input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadFile(file);
                  setNewMedia(url);
                }}
                className="mb-4"
              />

              <input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadFile(file);
                  setNewPhoto(url);
                }}
                className="mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={saveEdit}
                  className="bg-green-600 px-4 py-2 rounded"
                >
                  Save
                </button>

                <button
                  onClick={() => setEditingPost(null)}
                  className="bg-gray-600 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}