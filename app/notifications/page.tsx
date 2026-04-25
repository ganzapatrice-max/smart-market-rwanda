"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Notifications</h1>

      {notifications.map((n) => (
        <div key={n.id} className="bg-white p-3 mb-2 rounded shadow">

          {n.type === "like" && <p>👍 Someone liked your post</p>}
          {n.type === "comment" && <p>💬 New comment</p>}
          {n.type === "follow" && <p>➕ New follower</p>}

        </div>
      ))}
    </div>
  );
}