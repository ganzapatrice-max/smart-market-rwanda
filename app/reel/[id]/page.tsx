"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  doc,
} from "firebase/firestore";

export default function ReelsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [seen, setSeen] = useState<any>({});
  const [usersMap, setUsersMap] = useState<any>({});

  const router = useRouter();

  //////////////////////////////////////////////////////
  // LOAD STORIES (🔥 24 HOURS ONLY)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const yesterday = Timestamp.fromMillis(
      Date.now() - 24 * 60 * 60 * 1000
    );

    const q = query(
      collection(db, "posts"),
      where("type", "==", "video"),
      where("createdAt", ">", yesterday),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setVideos(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD USERS (REALTIME 🔥 FIX NAME ISSUE)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsubs: any[] = [];

    videos.forEach((video) => {
      if (!usersMap[video.userId]) {
        const unsub = onSnapshot(doc(db, "workers", video.userId), (snap) => {
          if (snap.exists()) {
            setUsersMap((prev: any) => ({
              ...prev,
              [video.userId]: snap.data(),
            }));
          }
        });

        unsubs.push(unsub);
      }
    });

    return () => unsubs.forEach((u) => u());
  }, [videos]);

  //////////////////////////////////////////////////////
  // MARK AS SEEN
  //////////////////////////////////////////////////////
  const markSeen = (id: string) => {
    setSeen((prev: any) => ({ ...prev, [id]: true }));
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="bg-gray-100 p-3">

      {/* 🔥 STORIES BAR */}
      <div className="flex gap-3 overflow-x-auto">

        {/* ➕ CREATE STORY */}
        <div className="min-w-[110px] h-[180px] bg-white rounded-xl shadow relative flex flex-col justify-end items-center cursor-pointer">
          <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl">
            +
          </div>
          <p className="text-xs font-semibold mb-2 text-black">
            Create story
          </p>
        </div>

        {/* 🔥 STORIES */}
        {videos.map((video) => {
          const user = usersMap[video.userId];

          return (
            <div
              key={video.id}
              onClick={() => {
                markSeen(video.id);
                router.push(`/reel/${video.id}`);
              }}
              className="min-w-[110px] h-[180px] rounded-xl overflow-hidden relative cursor-pointer"
            >
              {/* 🎥 VIDEO PREVIEW */}
              <video
                src={video.media}
                className="w-full h-full object-cover"
                muted
                playsInline
                onMouseEnter={(e) => {
                  e.currentTarget.currentTime = 0;
                  e.currentTarget.play();
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />

              {/* 🔵 PROFILE RING */}
              <div
                className={`absolute top-2 left-2 p-[2px] rounded-full ${
                  seen[video.id]
                    ? "bg-gray-400"
                    : "bg-blue-500"
                }`}
              >
                <img
                  src={
                    user?.photo ||
                    video.photo ||
                    "/default-avatar.png"
                  }
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>

              {/* 👤 NAME */}
              <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold leading-tight">
                {user?.name || video.name || "User"}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}