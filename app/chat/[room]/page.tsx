"use client";

import { use } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import Cropper from "react-easy-crop";
import {
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiSend,
} from "react-icons/fi";

import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

//////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////
type Message = {
  id: string;
  text?: string;
  image?: string;
  video?: string;
  audio?: string;
  document?: string;
  fileName?: string;
  sender: string;
  receiver: string;
  seen: boolean;
  replyTo?: string;
};

//////////////////////////////////////////////////////
// CLOUDINARY
//////////////////////////////////////////////////////
const CLOUD_NAME = "dmebligcw";
const UPLOAD_PRESET = "quickfix";

//////////////////////////////////////////////////////
// PAGE
//////////////////////////////////////////////////////
export default function ChatPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = use(params);
  const otherUser = decodeURIComponent(room);

  const [me, setMe] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [recording, setRecording] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  // image editor
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [rotation, setRotation] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  //////////////////////////////////////////////////////
  // LOGIN
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.email) setMe(user.email);
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // ROOM
  //////////////////////////////////////////////////////
  const roomId = [me, otherUser].sort().join("_");

  //////////////////////////////////////////////////////
  // LOAD CHAT
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!me) return;

    const q = query(
      collection(db, "chats", roomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Message[];

      setMessages(data);

      for (const msg of data) {
        if (msg.receiver === me && !msg.seen) {
          await updateDoc(
            doc(db, "chats", roomId, "messages", msg.id),
            { seen: true }
          );
        }
      }
    });

    return () => unsub();
  }, [me, roomId]);

  //////////////////////////////////////////////////////
  // CLOUDINARY
  //////////////////////////////////////////////////////
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  //////////////////////////////////////////////////////
  // SEND TEXT
  //////////////////////////////////////////////////////
  const sendMessage = async () => {
    if (!message.trim()) return;

    await setDoc(
      doc(db, "chats", roomId),
      {
        users: [me, otherUser],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "chats", roomId, "messages"), {
      text: message,
      sender: me,
      receiver: otherUser,
      seen: false,
      replyTo: replyTo?.text || "",
      createdAt: serverTimestamp(),
    });

    setMessage("");
    setReplyTo(null);
  };

  //////////////////////////////////////////////////////
  // FILE SELECT
  //////////////////////////////////////////////////////
  const uploadFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setShowEditor(true);
      return;
    }

    const url = await uploadToCloudinary(file);

    const data: any = {
      sender: me,
      receiver: otherUser,
      seen: false,
      createdAt: serverTimestamp(),
      fileName: file.name,
    };

    if (file.type.startsWith("video/")) data.video = url;
    else if (file.type.startsWith("audio/")) data.audio = url;
    else data.document = url;

    await addDoc(
      collection(db, "chats", roomId, "messages"),
      data
    );
  };

  //////////////////////////////////////////////////////
  // SEND EDITED IMAGE
  //////////////////////////////////////////////////////
  const sendEditedImage = async () => {
    if (!imageFile) return;

    const url = await uploadToCloudinary(imageFile);

    await addDoc(
      collection(db, "chats", roomId, "messages"),
      {
        image: url,
        sender: me,
        receiver: otherUser,
        seen: false,
        createdAt: serverTimestamp(),
      }
    );

    setShowEditor(false);
    setImageFile(null);
    setImagePreview("");
  };

  //////////////////////////////////////////////////////
  // VOICE RECORD
  //////////////////////////////////////////////////////
  const startRecording = async () => {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    const recorder = new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, {
        type: "audio/webm",
      });

      const file = new File([blob], "voice.webm");

      const url = await uploadToCloudinary(file);

      await addDoc(
        collection(db, "chats", roomId, "messages"),
        {
          audio: url,
          sender: me,
          receiver: otherUser,
          seen: false,
          createdAt: serverTimestamp(),
        }
      );
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////
  const deleteMessage = async (id: string) => {
    await deleteDoc(
      doc(db, "chats", roomId, "messages", id)
    );
    setSelectedMsg(null);
  };

  //////////////////////////////////////////////////////
  // EDIT
  //////////////////////////////////////////////////////
  const editMessage = async (msg: Message) => {
    const text = prompt("Edit message", msg.text || "");
    if (!text) return;

    await updateDoc(
      doc(db, "chats", roomId, "messages", msg.id),
      { text }
    );

    setSelectedMsg(null);
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="h-screen bg-[#111b21] text-white flex flex-col">

      {/* HEADER */}
      <div className="bg-[#075e54] p-4 flex justify-between items-center">

        <div>
          <h1 className="font-bold">{otherUser}</h1>
          <p className="text-xs text-gray-200">
            online
          </p>
        </div>

        <div className="flex gap-4 text-xl relative">
          <button title="Voice Call">
            <FiPhone />
          </button>

          <button title="Video Call">
            <FiVideo />
          </button>

          <button
            onClick={() =>
              setShowMenu(!showMenu)
            }
          >
            <FiMoreVertical />
          </button>

          {showMenu && (
            <div className="absolute top-8 right-0 bg-[#202c33] rounded shadow-lg text-sm w-40 z-50">
              <button className="block w-full p-2 text-left">
                Search
              </button>
              <button className="block w-full p-2 text-left">
                Wallpaper
              </button>
              <button className="block w-full p-2 text-left">
                Clear Chat
              </button>
              <Link
                href="/workers/profile"
                className="block p-2"
              >
                Back
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* REPLY */}
      {replyTo && (
        <div className="bg-[#202c33] p-2 text-sm flex justify-between">
          <span>
            Replying: {replyTo.text}
          </span>

          <button
            onClick={() =>
              setReplyTo(null)
            }
          >
            ✕
          </button>
        </div>
      )}

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map((msg) => {
          const mine = msg.sender === me;

          return (
            <div
              key={msg.id}
              className={`flex ${
                mine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedMsg(msg);
                }}
                className={`max-w-xs p-3 rounded-xl ${
                  mine
                    ? "bg-green-600"
                    : "bg-[#202c33]"
                }`}
              >
                {msg.replyTo && (
                  <div className="text-xs border-l-2 pl-2 mb-2">
                    {msg.replyTo}
                  </div>
                )}

                {msg.text && <p>{msg.text}</p>}

                {msg.image && (
                  <img
                    src={msg.image}
                    className="rounded mt-2"
                  />
                )}

                {msg.video && (
                  <video
                    controls
                    className="rounded mt-2"
                  >
                    <source src={msg.video} />
                  </video>
                )}

                {msg.audio && (
                  <audio
                    controls
                    className="w-full mt-2"
                  >
                    <source src={msg.audio} />
                  </audio>
                )}

                {msg.document && (
                  <a
                    href={msg.document}
                    target="_blank"
                    className="block bg-white text-black px-3 py-2 rounded mt-2"
                  >
                    📄 {msg.fileName}
                  </a>
                )}

                <div className="text-xs mt-2">
                  {mine &&
                    (msg.seen
                      ? "✓✓"
                      : "✓")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LONG PRESS MENU */}
      {selectedMsg && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#202c33] rounded-xl p-4 w-56 space-y-2">
            <button
              onClick={() =>
                setReplyTo(selectedMsg)
              }
              className="block w-full text-left"
            >
              ↩ Reply
            </button>

            <button
              onClick={() =>
                editMessage(selectedMsg)
              }
              className="block w-full text-left"
            >
              ✏ Edit
            </button>

            <button
              onClick={() =>
                deleteMessage(
                  selectedMsg.id
                )
              }
              className="block w-full text-left text-red-400"
            >
              🗑 Delete
            </button>

            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  selectedMsg.text || ""
                )
              }
              className="block w-full text-left"
            >
              📋 Copy
            </button>

            <button
              onClick={() =>
                setSelectedMsg(null)
              }
              className="block w-full text-left"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* IMAGE EDITOR */}
      {showEditor && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col">

          <div className="relative flex-1">
            <Cropper
              image={imagePreview}
              crop={{ x: 0, y: 0 }}
              zoom={1}
              aspect={1}
              onCropChange={() => {}}
              onZoomChange={() => {}}
            />
          </div>

          <div className="p-4 bg-[#202c33] flex gap-3 justify-center">
            <button
              onClick={() =>
                setRotation(rotation + 90)
              }
            >
              🔄 Rotate
            </button>

            <button>✏ Text</button>
            <button>🖍 Draw</button>

            <button
              onClick={sendEditedImage}
              className="bg-green-600 px-4 py-2 rounded"
            >
              Send
            </button>

            <button
              onClick={() =>
                setShowEditor(false)
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* INPUT */}
      <div className="p-3 bg-[#202c33]">

        {showEmoji && (
          <EmojiPicker
            onEmojiClick={(e) =>
              setMessage(
                (prev) =>
                  prev + e.emoji
              )
            }
          />
        )}

        <div className="flex gap-2 mt-2 items-center">

          <button
            onClick={() =>
              fileRef.current?.click()
            }
          >
            📎
          </button>

          <input
            ref={fileRef}
            hidden
            type="file"
            onChange={uploadFile}
          />

          <button
            onClick={() =>
              setShowEmoji(!showEmoji)
            }
          >
            😀
          </button>

          <button>🪄</button>

          <input
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            placeholder="Message..."
            className="flex-1 px-4 py-2 rounded-full bg-[#2a3942]"
          />

          <button
            onClick={
              recording
                ? stopRecording
                : startRecording
            }
          >
            {recording
              ? "⏹"
              : "🎤"}
          </button>

          <button
            onClick={sendMessage}
            className="bg-green-600 p-3 rounded-full"
          >
            <FiSend />
          </button>

        </div>
      </div>
    </main>
  );
}