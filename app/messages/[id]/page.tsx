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
  getDoc,
} from "firebase/firestore";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<any>(null);
  const [audio, setAudio] = useState<any>(null);
  const [members, setMembers] = useState<string[]>([]);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD CONVERSATION MEMBERS
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const snap = await getDoc(doc(db, "conversations", id));
      if (snap.exists()) {
        setMembers(snap.data().members || []);
      }
    };

    load();
  }, [id]);

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
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setMessages(data);

      // ✅ mark seen
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
    if (!user || (!text && !image && !audio)) return;

    const messageRef = await addDoc(collection(db, "messages"), {
      conversationId: id,
      senderId: user.uid,
      text,
      image,
      audio,
      seenBy: [user.uid],
      createdAt: serverTimestamp(),
    });

    // ✅ update conversation last message
    await updateDoc(doc(db, "conversations", id), {
      lastMessage: text || "📎 Media",
      lastSenderId: user.uid,
      updatedAt: serverTimestamp(),
    });

    // ✅ send notification to others
    const otherUsers = members.filter((m) => m !== user.uid);

    await Promise.all(
      otherUsers.map((uid) =>
        addDoc(collection(db, "notifications"), {
          toUserId: uid,
          fromUserId: user.uid,
          type: "message",
          postId: id,
          createdAt: serverTimestamp(),
          read: false,
        })
      )
    );

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
        {messages.map((m) => (
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
              <p className="text-xs mt-1">
                {m.seenBy?.length > 1 ? "✔✔ Seen" : "✔ Sent"}
              </p>
            )}
          </div>
        ))}
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