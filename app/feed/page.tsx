"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function FeedPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [usersMap, setUsersMap] = useState<any>({});
  const [autoPlay, setAutoPlay] = useState(true);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // POSTS (REALTIME)
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
  // USERS REALTIME (🔥 FIXED: workers collection)
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!posts.length) return;

    const unsubs: any[] = [];

    posts.forEach((post) => {
      if (!usersMap[post.userId]) {
        const unsub = onSnapshot(doc(db, "workers", post.userId), (snap) => {
          if (snap.exists()) {
            setUsersMap((prev: any) => ({
              ...prev,
              [post.userId]: snap.data(),
            }));
          }
        });

        unsubs.push(unsub);
      }
    });

    return () => unsubs.forEach((u) => u());
  }, [posts]);

  //////////////////////////////////////////////////////
  // AUTO PLAY
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!autoPlay) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [posts, autoPlay]);

  //////////////////////////////////////////////////////
  // LIKE / DELETE / SHARE
  //////////////////////////////////////////////////////
  const likePost = async (id: string) => {
    await updateDoc(doc(db, "posts", id), {
      likes: increment(1),
    });
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "posts", id));
  };

  const sharePost = async (post: any) => {
    if (!user) return;

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
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="bg-gray-100 min-h-screen p-3 space-y-4">

      {/* 🔝 TOP */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl">
        <h1 className="font-bold text-black">Smart Market Rwanda</h1>

        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className="bg-blue-600 text-white px-4 py-1 rounded-full"
        >
          {autoPlay ? "AutoPlay ON" : "AutoPlay OFF"}
        </button>
      </div>

      {/* 🔥 STORIES / REELS */}
      <div className="flex gap-3 overflow-x-auto">

        {/* CREATE */}
        <div className="min-w-[110px] h-[180px] bg-white rounded-xl flex items-center justify-center text-black font-bold cursor-pointer">
          +
        </div>

        {posts
          .filter((p) => p.type === "video")
          .map((post) => {
            const userData = usersMap[post.userId];

            return (
              <div
                key={post.id}
                onClick={() => router.push(`/reel/${post.id}`)}
                className="min-w-[110px] h-[180px] relative rounded-xl overflow-hidden cursor-pointer"
              >
                <video
                  src={post.media}
                  className="w-full h-full object-cover"
                  muted
                />

                {/* PROFILE */}
                <img
                  src={
                    userData?.photo ||
                    post.photo ||
                    "/default-avatar.png"
                  }
                  className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-blue-500"
                />

                {/* NAME */}
                <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold">
                  {userData?.name || post.name || "User"}
                </p>
              </div>
            );
          })}
      </div>

      {/* POSTS */}
      {posts.map((post, i) => {
        const userData = usersMap[post.userId];

        return (
          <div key={post.id} className="bg-white p-4 rounded-xl">

            {/* HEADER */}
            <div className="flex justify-between">

              <div className="flex gap-2 items-center">
                <img
                  src={
                    userData?.photo ||
                    post.photo ||
                    "/default-avatar.png"
                  }
                  className="w-10 h-10 rounded-full border-2 border-blue-500"
                />

                <div>
                  <p className="font-semibold text-black text-sm">
                    {userData?.name || post.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {post.type}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <FollowButton targetUserId={post.userId} />

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
              <p className="my-3 text-black">{post.text}</p>
            )}

            {/* MEDIA */}
            {post.media && (
              post.type === "video" ? (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={post.media}
                  controls={!autoPlay}
                  muted
                  loop
                  className="rounded w-full"
                />
              ) : (
                <img src={post.media} className="rounded w-full" />
              )
            )}

            {/* ACTIONS */}
            <div className="flex justify-around mt-3 text-sm">
              <button onClick={() => likePost(post.id)}>
                👍 {post.likes || 0}
              </button>
              <button>💬</button>
              <button onClick={() => sharePost(post)}>
                ↗ {post.shares || 0}
              </button>
            </div>

            <Comments postId={post.id} postOwnerId={post.userId} />
          </div>
        );
      })}
    </main>
  );
}