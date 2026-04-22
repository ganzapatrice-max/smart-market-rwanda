"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Comments({ postId }: { postId: string }) {
  const [user, setUser] = useState<any>(null);
  const [text, setText] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // GET USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD COMMENTS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((doc) => doc.data()));
    });

    return () => unsub();
  }, [postId]);

  //////////////////////////////////////////////////////
  // ADD COMMENT
  //////////////////////////////////////////////////////
  const sendComment = async () => {
    if (!text.trim() || !user) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      text,
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="mt-4">

      {/* COMMENT LIST */}
      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
        {comments.map((c, i) => (
          <div
            key={i}
            className="bg-[#1e293b] p-2 rounded-lg text-sm"
          >
            <span className="font-bold text-green-400">
              {c.userEmail}
            </span>
            <p>{c.text}</p>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2 rounded-lg bg-[#0f172a]"
        />

        <button
          onClick={sendComment}
          className="bg-blue-600 px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}