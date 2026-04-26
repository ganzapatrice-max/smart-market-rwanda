"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsub();
  }, [user]);

  return (
    <main className="min-h-screen bg-[#f0f2f5] p-4">
      <div className="max-w-xl mx-auto bg-white p-4 rounded-xl shadow">
        <h1 className="text-lg font-bold mb-4">🔔 Notifications</h1>

        {notifications.map((n) => (
          <div key={n.id} className="border-b py-3 text-sm">
            {n.type === "like" && "👍 Someone liked your post"}
            {n.type === "comment" && "💬 Someone commented on your post"}
            {n.type === "follow" && "👤 Someone followed you"}
          </div>
        ))}

        {!notifications.length && (
          <p className="text-gray-500 text-sm">No notifications yet</p>
        )}
      </div>
    </main>
  );
}