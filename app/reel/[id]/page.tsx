"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function ReelsPage() {
  const [videos, setVideos] = useState<any[]>([]);

  // ✅ FIXED TYPE
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  //////////////////////////////////////////////////////
  // LOAD VIDEOS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("type", "==", "video")
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
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {videos.map((video, i) => (
        <div
          key={video.id}
          className="h-screen flex items-center justify-center snap-start"
        >
          <video
            ref={(el) => {
              videoRefs.current[i] = el; // ✅ FIXED (no return)
            }}
            src={video.media}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
          />
        </div>
      ))}
    </main>
  );
}