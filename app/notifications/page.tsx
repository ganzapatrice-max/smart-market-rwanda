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
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
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
    <main className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-xl font-bold mb-4">🔔 Notifications</h1>

      {notifications.length === 0 && <p>No notifications</p>}

      {notifications.map((n) => (
        <div key={n.id} className="bg-gray-800 p-3 rounded mb-2">
          <p>
            <b>{n.type}</b> from {n.fromUserId}
          </p>
        </div>
      ))}
    </main>
  );
}