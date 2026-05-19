"use client";

import { useEffect, useState, useRef } from "react";
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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  //////////////////////////////////////////////////////
  // LOAD VIDEOS (WITH ORDER)
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
  // AUTO PLAY ON SCROLL
  //////////////////////////////////////////////////////
  useEffect(() => {
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
      { threshold: 0.8 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [videos]);

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
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">

      {videos.map((video, i) => (
        <div
          key={video.id}
          className="h-screen relative snap-start"
        >
          {/* VIDEO */}
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={video.media}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
          />

          {/* 🔥 OVERLAY UI */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">

            {/* USER INFO */}
            <div className="flex items-center gap-3 mb-2">

              <img
                src={video.photo || "/default-avatar.png"}
                className="w-10 h-10 rounded-full object-cover border"
              />

              <div>
                <p className="font-bold">{video.name || "User"}</p>
                <p className="text-xs text-gray-300">
                  {formatTime(video.createdAt)}
                </p>
              </div>

            </div>

            {/* TEXT */}
            {video.text && (
              <p className="text-sm mb-2">
                {video.text}
              </p>
            )}

          </div>

        </div>
      ))}

    </main>
  );
}