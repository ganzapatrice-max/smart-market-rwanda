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
  const [stories, setStories] = useState<any[]>([]);
  const [seen, setSeen] = useState<any>({});
  const [usersMap, setUsersMap] = useState<any>({});

  const router = useRouter();

  //////////////////////////////////////////////////////
  // LOAD STORIES (ONLY 24H + ONLY isStory)
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
      setStories(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD USERS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsubs: any[] = [];

    stories.forEach((story) => {
      if (!usersMap[story.userId]) {
        const unsub = onSnapshot(doc(db, "workers", story.userId), (snap) => {
          if (snap.exists()) {
            setUsersMap((prev: any) => ({
              ...prev,
              [story.userId]: snap.data(),
            }));
          }
        });

        unsubs.push(unsub);
      }
    });

    return () => unsubs.forEach((u) => u());
  }, [stories]);

  //////////////////////////////////////////////////////
  // MARK SEEN
  //////////////////////////////////////////////////////
  const markSeen = (id: string) => {
    setSeen((prev: any) => ({ ...prev, [id]: true }));
  };

  //////////////////////////////////////////////////////
  // UI (ONLY STORIES BAR)
  //////////////////////////////////////////////////////
  return (
    <div className="flex gap-3 overflow-x-auto">

      {/* CREATE STORY */}
      <div
        onClick={() => router.push("/post")}
        className="min-w-[110px] h-[180px] bg-white rounded-xl shadow relative flex flex-col justify-end items-center cursor-pointer"
      >
        <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl">
          +
        </div>
        <p className="text-xs font-semibold mb-2 text-black">
          Create story
        </p>
      </div>

      {/* STORIES */}
      {stories.map((story) => {
        const user = usersMap[story.userId];

        return (
          <div
            key={story.id}
            onClick={() => {
              markSeen(story.id);
              router.push(`/reel/${story.id}`);
            }}
            className="min-w-[110px] h-[180px] rounded-xl overflow-hidden relative cursor-pointer"
          >
            {/* VIDEO */}
            <video
              src={story.media}
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

            {/* PROFILE RING */}
            <div
              className={`absolute top-2 left-2 p-[2px] rounded-full ${
                seen[story.id] ? "bg-gray-400" : "bg-blue-500"
              }`}
            >
              <img
                src={
                  user?.photo ||
                  story.photo ||
                  "/default-avatar.png"
                }
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>

            {/* NAME */}
            <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold">
              {user?.name || story.name || "User"}
            </p>
          </div>
        );
      })}
    </div>
  );
}