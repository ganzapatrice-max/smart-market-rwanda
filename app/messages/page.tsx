"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [convos, setConvos] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setConvos(data);
    });

    return () => unsub();
  }, [user]);

  // 👤 load users
  useEffect(() => {
    const load = async () => {
      const map: any = {};

      for (let c of convos) {
        for (let m of c.members) {
          if (!map[m]) {
            const snap = await getDoc(doc(db, "users", m));
            if (snap.exists()) map[m] = snap.data();
          }
        }
      }

      setUsersMap(map);
    };

    load();
  }, [convos]);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="font-bold text-xl mb-4">💬 Messages</h1>

      {convos.map((c) => {
        const other = c.members.find((m: any) => m !== user?.uid);
        const userData = usersMap[other];

        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className="flex items-center gap-3 bg-white p-3 rounded shadow mb-2"
          >
            <img
              src={userData?.photo || "/default-avatar.png"}
              className="w-10 h-10 rounded-full"
            />

            <div className="flex-1">
              <p className="font-semibold">
                {c.isGroup ? c.name : userData?.name || "User"}
              </p>

              <p className="text-sm text-gray-500">
                {c.lastMessage}
              </p>
            </div>
          </Link>
        );
      })}
    </main>
  );
}