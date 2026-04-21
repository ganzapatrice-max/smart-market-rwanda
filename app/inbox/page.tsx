"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";

import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Worker = {
  id: string;
  name?: string;
  job?: string;
};

export default function InboxPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [me, setMe] = useState("");

  //////////////////////////////////////////////////////
  // GET LOGGED USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setMe(user.email);
      }
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD WORKERS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "workers"),
      (snap) => {
        const data: Worker[] = snap.docs.map(
          (doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<
              Worker,
              "id"
            >),
          })
        );

        setWorkers(data);
      }
    );

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#111b21] text-white p-5">
      <h1 className="text-2xl font-bold mb-5">
        Chats
      </h1>

      <div className="space-y-3">
        {workers
          .filter(
            (worker) => worker.id !== me
          )
          .map((worker) => (
            <Link
              key={worker.id}
              href={`/chat/${encodeURIComponent(
                worker.id
              )}`}
              className="block bg-[#202c33] p-4 rounded-xl hover:bg-[#2a3942]"
            >
              <h2 className="font-semibold">
                {worker.name ||
                  worker.id}
              </h2>

              <p className="text-sm text-gray-400">
                {worker.job ||
                  "Worker"}
              </p>
            </Link>
          ))}
      </div>
    </main>
  );
}