"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

// ✅ Message type
type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  image?: string;
  audio?: string;
  seenBy?: string[];
  createdAt?: any;
};

export default function ChatPage() {
  const { id } = useParams();

  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD MESSAGES
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!id || !user) return;

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", id),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Message[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }));

      setMessages(data);

      // ✅ mark seen safely
      data.forEach(async (m) => {
        if (!m.seenBy?.includes(user.uid)) {
          await updateDoc(doc(db, "messages", m.id), {
            seenBy: [...(m.seenBy || []), user.uid],
          });
        }
      });
    });

    return () => unsub();
  }, [id, user]);

  //////////////////////////////////////////////////////
  // SEND MESSAGE
  //////////////////////////////////////////////////////
  const sendMessage = async () => {
    if (!text && !image && !audio) return;

    await addDoc(collection(db, "messages"), {
      conversationId: id,
      senderId: user.uid,
      text,
      image,
      audio,
      seenBy: [user.uid],
      createdAt: serverTimestamp(),
    });

    // ✅ notification (replace with real receiver later)
    await addDoc(collection(db, "notifications"), {
      toUserId: "TARGET_USER_ID",
      fromUserId: user.uid,
      type: "message",
      createdAt: serverTimestamp(),
      read: false,
    });

    setText("");
    setImage(null);
    setAudio(null);
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto">
      
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => {
          const seenCount = m.seenBy?.length || 0; // ✅ FIX HERE

          return (
            <div
              key={m.id}
              className={`p-2 rounded max-w-[70%] ${
                m.senderId === user?.uid
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-200"
              }`}
            >
              {m.text && <p>{m.text}</p>}

              {m.image && (
                <img src={m.image} className="rounded mt-2" />
              )}

              {m.audio && (
                <audio controls src={m.audio} />
              )}

              {/* ✔ seen */}
              {m.senderId === user?.uid && (
                <p className="text-xs">
                  {seenCount > 1 ? "✔✔ Seen" : "✔ Sent"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 p-2 border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Message..."
        />

        <input
          type="file"
          onChange={(e) =>
            setImage(URL.createObjectURL(e.target.files![0]))
          }
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </main>
  );
}