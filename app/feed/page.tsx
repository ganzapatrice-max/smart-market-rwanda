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
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
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
  // USERS REALTIME (FIXED → workers + live updates)
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
  // AUTO PLAY VIDEOS
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
  // FILTER + SEARCH
  //////////////////////////////////////////////////////
  const filteredPosts = posts.filter((post) => {
    const matchType = filter === "all" || post.type === filter;

    const name = usersMap[post.userId]?.name || "";
    const matchSearch =
      post.text?.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase());

    return matchType && matchSearch;
  });

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="w-full space-y-4 p-3">

      {/* 🔝 AUTO PLAY TOGGLE */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl">
        <p className="text-black font-semibold">Feed</p>

        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className="bg-blue-600 text-white px-4 py-1 rounded-full"
        >
          {autoPlay ? "AutoPlay ON" : "AutoPlay OFF"}
        </button>
      </div>

      {/* 🔍 SEARCH */}
      <div className="bg-white p-3 rounded-xl">
        <input
          placeholder="Search posts or users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 bg-gray-100 text-black rounded"
        />
      </div>

      {/* POSTS */}
      {filteredPosts.map((post, i) => {
        const userData = usersMap[post.userId];

        return (
          <div key={post.id} className="bg-white p-4 rounded-xl">

            {/* HEADER */}
            <div className="flex justify-between">

              <div className="flex gap-2 items-center">
                {userData?.photo && (
                  <img
                    src={userData.photo}
                    className="w-10 h-10 rounded-full"
                  />
                )}

                <div>
                  <p className="font-semibold text-black text-sm">
                    {userData?.name || "Loading..."}
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
              <button onClick={() => likePost(post.id)}>👍 {post.likes || 0}</button>
              <button>💬</button>
              <button onClick={() => sharePost(post)}>↗ {post.shares || 0}</button>
            </div>

            <Comments postId={post.id} postOwnerId={post.userId} />
          </div>
        );
      })}
    </main>
  );
}