"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../../lib/firebase";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function AdminChatReaderPage() {
  const params = useParams();
  const chatId = params.id as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [chatInfo, setChatInfo] = useState<any>(null);

  //////////////////////////////////////////////////////
  // LOAD CHAT INFO
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsubChat = onSnapshot(
      doc(db, "chats", chatId),
      (snap) => {
        if (snap.exists()) {
          setChatInfo({
            id: snap.id,
            ...snap.data(),
          });
        }
      }
    );

    return () => unsubChat();
  }, [chatId]);

  //////////////////////////////////////////////////////
  // LOAD MESSAGES LIVE
  //////////////////////////////////////////////////////
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setMessages(data);
    });

    return () => unsub();
  }, [chatId]);

  //////////////////////////////////////////////////////
  // DELETE CHAT
  //////////////////////////////////////////////////////
  const deleteChat = async () => {
    const ok = confirm(
      "Delete this full chat?"
    );

    if (!ok) return;

    await deleteDoc(
      doc(db, "chats", chatId)
    );

    alert("Chat Deleted");
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white p-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold">
            💬 Live Chat Reader
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Admin monitoring system
          </p>
        </div>

        <Link
          href="/admin/chats"
          className="bg-gray-700 px-4 py-2 rounded-xl"
        >
          Back
        </Link>
      </div>

      {/* CHAT USERS */}
      <div className="bg-[#111827] rounded-3xl p-5 mb-5 border border-gray-700 shadow-xl">
        <p>
          🧑 Patient:{" "}
          <span className="font-bold">
            {chatInfo?.patientName ||
              "Unknown"}
          </span>
        </p>

        <p className="mt-2">
          👷 Technician:{" "}
          <span className="font-bold">
            {chatInfo?.technicianName ||
              "Unknown"}
          </span>
        </p>

        <p className="mt-2">
          💬 Messages:{" "}
          <span className="font-bold">
            {messages.length}
          </span>
        </p>
      </div>

      {/* DELETE BUTTON */}
      <button
        onClick={deleteChat}
        className="w-full bg-red-600 p-4 rounded-2xl font-bold mb-5 hover:bg-red-700"
      >
        🗑 Delete Chat
      </button>

      {/* LIVE CHAT */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-2xl max-w-[85%] ${
              msg.senderRole ===
              "technician"
                ? "bg-green-600 ml-auto"
                : "bg-blue-600"
            }`}
          >
            <p className="text-sm font-bold mb-1">
              {msg.senderName ||
                "Unknown"}
            </p>

            <p>{msg.text}</p>

            <p className="text-xs mt-2 opacity-80">
              {msg.createdAt
                ? msg.createdAt
                    .toDate()
                    .toLocaleString()
                : ""}
            </p>
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {messages.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No messages yet
        </p>
      )}
    </main>
  );
}