"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function Comments({
  postId,
  postOwnerId,
}: {
  postId: string;
  postOwnerId: string;
}) {
  const [user, setUser] = useState<any>(null);
  const [text, setText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD COMMENTS (REAL-TIME)
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, [postId]);

  //////////////////////////////////////////////////////
  // ADD COMMENT
  //////////////////////////////////////////////////////
  const sendComment = async () => {
    if (!text.trim() || !user) return;

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: text.trim(),
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });

      // 🔔 NOTIFICATION
      if (postOwnerId !== user.uid) {
        await addDoc(collection(db, "notifications"), {
          toUserId: postOwnerId,
          fromUserId: user.uid,
          type: "comment",
          postId,
          createdAt: serverTimestamp(),
          read: false,
        });
      }

      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="mt-3">

      {/* ✅ CLICK TO OPEN COMMENTS */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-sm text-blue-500 mb-2"
      >
        💬 {comments.length} Comments
      </button>

      {/* COMMENTS LIST */}
      {showComments && (
        <>
          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {comments.length === 0 && (
              <p className="text-gray-400 text-sm">No comments yet</p>
            )}

            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-[#1e293b] p-2 rounded-lg text-sm"
              >
                <span className="font-bold text-green-400">
                  {c.userEmail || "User"}
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
              className="flex-1 p-2 rounded-lg bg-[#0f172a] outline-none"
            />

            <button
              onClick={sendComment}
              className="bg-blue-600 px-4 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}