"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function ReelPage() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "posts", id as string));
      if (snap.exists()) setPost(snap.data());
    };
    load();
  }, [id]);

  if (!post) return null;

  return (
    <main className="h-screen bg-black flex items-center justify-center relative">

      <video
        src={post.media}
        autoPlay
        controls
        className="h-full w-full object-cover"
      />

      <div className="absolute bottom-10 left-4 flex items-center gap-2 bg-black/60 p-2 rounded-lg">
        <img
          src={post.photo || "/default-avatar.png"}
          className="w-10 h-10 rounded-full"
        />
        <span>{post.name}</span>
      </div>

    </main>
  );
}