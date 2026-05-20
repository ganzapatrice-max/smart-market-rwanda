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
} from "firebase/firestore";

export default function FeedPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [usersMap, setUsersMap] = useState<any>({});
  const [autoPlay, setAutoPlay] = useState(true);
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
  // POSTS (ALL)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // STORIES (ONLY isStory + 24H)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const yesterday = Timestamp.fromMillis(
      Date.now() - 24 * 60 * 60 * 1000
    );

    const q = query(
      collection(db, "posts"),
      where("isStory", "==", true),
      where("createdAt", ">", yesterday),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // USERS
  //////////////////////////////////////////////////////
  useEffect(() => {
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
  // AUTOPLAY + SOUND
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!autoPlay) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            video.muted = false;
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
  }, [posts, autoPlay]);

  //////////////////////////////////////////////////////
  // HELPERS
  //////////////////////////////////////////////////////
  const formatTime = (ts: any) => {
    if (!ts?.seconds) return "";
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  //////////////////////////////////////////////////////
  // ACTIONS
  //////////////////////////////////////////////////////
  const likePost = async (id: string) => {
    await updateDoc(doc(db, "posts", id), {
      likes: increment(1),
    });
  };

  const sharePost = async (post: any) => {
    await updateDoc(doc(db, "posts", post.id), {
      shares: increment(1),
    });
  };

  //////////////////////////////////////////////////////
  // FILTER (NO STORIES)
  //////////////////////////////////////////////////////
  const filteredPosts = posts.filter((p) => {
    if (p.isStory) return false;

    const u = usersMap[p.userId] || {};

    const matchFilter = filter === "all" || p.type === filter;

    const matchSearch =
      p.text?.toLowerCase().includes(search.toLowerCase()) ||
      u?.name?.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="sticky top-0 bg-white p-3 space-y-3 z-50 shadow">

        <div className="flex justify-between">
          <h1 className="font-bold text-black">Smart Market</h1>

          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="bg-blue-600 text-white px-3 py-1 rounded-full"
          >
            {autoPlay ? "Sound ON" : "Sound OFF"}
          </button>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 overflow-x-auto">
          {["all", "video", "image", "text"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full ${
                filter === f ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 bg-gray-100 rounded"
        />

        {/* 🔥 STORIES FIRST (ABOVE INPUT) */}
        <div className="flex gap-3 overflow-x-auto">
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

        {/* WHAT'S ON YOUR MIND */}
        <div
          onClick={() => router.push("/post")}
          className="flex gap-2 bg-gray-100 p-2 rounded-full cursor-pointer"
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
      </div>

      {/* POSTS (VERTICAL ONLY) */}
      <div className="p-3 space-y-4">
        {filteredPosts.map((post, i) => {
          const u = usersMap[post.userId];

          return (
            <div key={post.id} className="bg-white p-4 rounded-xl">

              {/* HEADER */}
              <div className="flex justify-between">
                <div
                  onClick={() => router.push(`/profile/${post.userId}`)}
                  className="flex gap-2 items-center cursor-pointer"
                >
                  <img
                    src={u?.photo || "/default-avatar.png"}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-black text-sm">
                      {u?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(post.createdAt)}
                    </p>
                  </div>
                </div>

                <FollowButton targetUserId={post.userId} />
              </div>

              {/* TEXT */}
              {post.text && (
                <p className="my-3 text-black">{post.text}</p>
              )}

              {/* MEDIA */}
              {post.media &&
                (post.type === "video" ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={post.media}
                    controls={!autoPlay}
                    muted={!autoPlay}
                    loop
                    className="rounded w-full"
                  />
                ) : (
                  <img src={post.media} className="rounded w-full" />
                ))}

              {/* ACTIONS */}
              <div className="flex justify-around mt-3 text-sm">
                <button onClick={() => likePost(post.id)}>
                  👍 {post.likes || 0}
                </button>
                <button>💬 {post.comments || 0}</button>
                <button onClick={() => sharePost(post)}>
                  ↗ {post.shares || 0}
                </button>
                <span>👁 {post.views || 0}</span>
              </div>

              <Comments postId={post.id} postOwnerId={post.userId} />
            </div>
          );
        })}
      </div>
    </main>
  );
}