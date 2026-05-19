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
} from "firebase/firestore";

export default function ReelsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const router = useRouter();

  //////////////////////////////////////////////////////
  // LOAD VIDEOS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("type", "==", "video"),
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
  // FORMAT TIME
  //////////////////////////////////////////////////////
  const formatTime = (ts: any) => {
    if (!ts?.seconds) return "";
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="bg-black p-4">

      {/* 🔥 HORIZONTAL REELS */}
      <div className="flex gap-4 overflow-x-auto">

        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => router.push(`/reel/${video.id}`)}
            className="min-w-[200px] h-[320px] relative cursor-pointer rounded-xl overflow-hidden"
          >
            {/* VIDEO PREVIEW */}
            <video
              src={video.media}
              className="w-full h-full object-cover"
              muted
              playsInline
            />

            {/* OVERLAY */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">

              {/* USER */}
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={video.photo || ""}
                  className="w-8 h-8 rounded-full object-cover border"
                />

                <div>
                  <p className="text-sm font-bold">
                    {video.name || "User"}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatTime(video.createdAt)}
                  </p>
                </div>
              </div>

              {/* TEXT */}
              {video.text && (
                <p className="text-xs line-clamp-2">
                  {video.text}
                </p>
              )}

            </div>
          </div>
        ))}

      </div>

    </main>
  );
}