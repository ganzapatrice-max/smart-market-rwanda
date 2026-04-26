"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD CONVERSATIONS
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setConversations(data);
    });

    return () => unsub();
  }, [user]);

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="max-w-2xl mx-auto p-4 space-y-3">

      <h1 className="text-xl font-bold">💬 Messages</h1>

      {conversations.length === 0 && (
        <p className="text-gray-500">No chats yet</p>
      )}

      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`/messages/${c.id}`}
          className="block p-3 bg-white rounded-lg shadow"
        >
          <p className="font-semibold">
            {c.name || "Conversation"}
          </p>

          <p className="text-sm text-gray-500">
            {c.lastMessage || "Start chatting..."}
          </p>
        </Link>
      ))}
    </main>
  );
}