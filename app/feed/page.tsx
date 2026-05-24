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
  increment,
  where,
  Timestamp,
  limit,
} from "firebase/firestore";

export default function FeedPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [usersMap, setUsersMap] = useState<any>({});
  const [autoPlay, setAutoPlay] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // POSTS (LIMITED)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // STORIES (FAST 🔥)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const yesterday = Timestamp.fromMillis(
      Date.now() - 24 * 60 * 60 * 1000
    );

    const q = query(
      collection(db, "posts"),
      where("isStory", "==", true),
      where("createdAt", ">", yesterday),
      orderBy("createdAt", "desc"),
      limit(10) // 🚀 IMPORTANT
    );

    const unsub = onSnapshot(q, (snap) => {
      setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // USERS (ONLY STORIES 🔥)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsubs: any[] = [];

    stories.forEach((s) => {
      if (!usersMap[s.userId]) {
        const unsub = onSnapshot(doc(db, "workers", s.userId), (snap) => {
          if (snap.exists()) {
            setUsersMap((prev: any) => ({
              ...prev,
              [s.userId]: snap.data(),
            }));
          }
        });

        unsubs.push(unsub);
      }
    });

    return () => unsubs.forEach((u) => u());
  }, [stories, usersMap]);

  //////////////////////////////////////////////////////
  // AUTOPLAY
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

    videoRefs.current.forEach((v) => v && observer.observe(v));

    return () => observer.disconnect();
  }, [autoPlay]);

  //////////////////////////////////////////////////////
  // FILTER
  //////////////////////////////////////////////////////
  const filteredPosts = posts.filter((p) => {
    if (p.isStory) return false;

    const u = usersMap[p.userId] || {};

    return (
      (filter === "all" || p.type === filter) &&
      (p.text?.toLowerCase().includes(search.toLowerCase()) ||
        u?.name?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="sticky top-0 bg-white z-50 shadow">

        <div className="p-3 flex justify-between">
          <h1 className="font-bold text-black">Smart Market</h1>
        </div>

        {/* SEARCH */}
        <div className="px-3 pb-2">
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 bg-gray-100 rounded"
          />
        </div>

        {/* CREATE */}
        <div
          onClick={() => router.push("/post?story=true")}
          className="mx-3 mb-3 flex gap-2 bg-gray-100 p-2 rounded-full cursor-pointer"
        >
          <img
            src={
              (user && usersMap[user?.uid]?.photo) ||
              "/default-avatar.png"
            }
            className="w-8 h-8 rounded-full"
          />
          <p className="text-gray-500">What’s on your mind?</p>
        </div>

        {/* 🔥 STORIES */}
        <div className="flex gap-3 overflow-x-auto px-3 pb-3">

          {/* ADD STORY */}
          <div
            onClick={() => router.push("/post?story=true")}
            className="min-w-[110px] h-[180px] bg-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer"
          >
            <span className="text-2xl">+</span>
            <p className="text-xs">Add Story</p>
          </div>

          {stories.map((s) => {
            const u = usersMap[s.userId];

            return (
              <div
                key={s.id}
                onClick={() => router.push(`/reel/${s.id}`)}
                className="min-w-[110px] h-[180px] rounded-xl overflow-hidden relative cursor-pointer"
              >
                <video
                  src={s.media}
                  className="w-full h-full object-cover"
                  muted
                  preload="none" // 🚀 FIX
                  playsInline
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />

                <img
                  src={u?.photo || "/default-avatar.png"}
                  className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-blue-500"
                />

                <p className="absolute bottom-2 left-2 text-white text-xs">
                  {u?.name || "User"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* POSTS */}
      <div className="p-3 space-y-4">
        {filteredPosts.map((post, i) => {
          const u = usersMap[post.userId];

          return (
            <div key={post.id} className="bg-white p-4 rounded-xl">
              <FollowButton targetUserId={post.userId} />

              {post.text && <p className="my-3">{post.text}</p>}

              {post.media &&
                (post.type === "video" ? (
                  <video
                ref={(el) => {
  videoRefs.current[i] = el;
}}
                    src={post.media}
                    controls
                    preload="none"
                    className="rounded w-full"
                  />
                ) : (
                  <img src={post.media} className="rounded w-full" loading="lazy" />
                ))}

              <div className="flex justify-around mt-3 text-sm">
                <button onClick={() => likePost(post.id)}>
                  👍 {post.likes || 0}
                </button>
              </div>

              <Comments postId={post.id} postOwnerId={post.userId} />
            </div>
          );
        })}
      </div>
    </main>
  );
}