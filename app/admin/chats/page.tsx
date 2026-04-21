"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";

import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function AdminChatsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  //////////////////////////////////////////////////////
  // LOAD CHATS LIVE
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "chats"),
      (snap) => {
        const data = snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setChats(data);
      }
    );

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // DELETE CHAT
  //////////////////////////////////////////////////////
  const deleteChat = async (id: string) => {
    const ok = confirm(
      "Delete this chat permanently?"
    );

    if (!ok) return;

    await deleteDoc(doc(db, "chats", id));
  };

  //////////////////////////////////////////////////////
  // SEARCH
  //////////////////////////////////////////////////////
  const filteredChats = chats.filter((chat) =>
    `${chat.patientName || ""} ${
      chat.technicianName || ""
    } ${chat.lastMessage || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  //////////////////////////////////////////////////////
  // DATE FORMAT
  //////////////////////////////////////////////////////
  const formatDate = (time: any) => {
    if (!time) return "No date";

    return time
      .toDate()
      .toLocaleString();
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white p-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            💬 Chat Tracking
          </h1>

          <p className="text-gray-400 mt-1">
            Monitor all platform chats
          </p>
        </div>

        <Link
          href="/admin"
          className="bg-gray-700 px-4 py-2 rounded-xl"
        >
          Back
        </Link>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search chats..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full p-4 rounded-2xl bg-[#1f2937] outline-none mb-6"
      />

      {/* TOTAL */}
      <div className="bg-cyan-600 rounded-3xl p-5 text-center mb-6 shadow-xl">
        <p className="text-lg">
          Total Chats
        </p>

        <h2 className="text-4xl font-bold">
          {filteredChats.length}
        </h2>
      </div>

      {/* CHAT LIST */}
      <div className="space-y-5">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className="bg-[#111827] border border-gray-700 rounded-3xl p-5 shadow-xl"
          >
            {/* TOP */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                💬 {chat.messageCount || 0} Messages
              </span>
            </div>

            {/* USERS */}
            <p className="text-lg font-bold">
              🧑 Patient:{" "}
              {chat.patientName ||
                "Unknown"}
            </p>

            <p className="text-gray-300 mt-1">
              👷 Technician:{" "}
              {chat.technicianName ||
                "Unknown"}
            </p>

            {/* LAST MESSAGE */}
            <div className="mt-4 bg-[#1f2937] p-4 rounded-2xl">
              <p className="text-yellow-400 text-sm mb-1">
                Last Message
              </p>

              <p>
                {chat.lastMessage ||
                  "No messages"}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {formatDate(
                  chat.updatedAt
                )}
              </p>
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-2 gap-3 mt-5">

              <Link
                href={`/admin/chats/${chat.id}`}
                className="bg-green-500 text-white text-center font-bold p-4 rounded-2xl shadow-lg hover:bg-green-600"
              >
                💬 OPEN CHAT
              </Link>

              <button
                onClick={() =>
                  deleteChat(chat.id)
                }
                className="bg-red-500 text-white font-bold p-4 rounded-2xl shadow-lg hover:bg-red-600"
              >
                🗑 DELETE
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {filteredChats.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No chats found
        </p>
      )}
    </main>
  );
}