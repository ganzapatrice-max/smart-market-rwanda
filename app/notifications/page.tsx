"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

// ✅ ADD TYPE (fixes your error)
type Notification = {
  id: string;
  toUserId: string;
  fromUserId: string;
  type: string;
  postId?: string;
  createdAt?: any;
  read?: boolean;
};

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD NOTIFICATIONS (REALTIME 🔥)
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Notification[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Notification, "id">),
      }));

      setNotifications(data);

      // ✅ mark as read safely
      data.forEach(async (n) => {
        if (!n.read) {
          await updateDoc(doc(db, "notifications", n.id), {
            read: true,
          });
        }
      });
    });

    return () => unsub();
  }, [user]);

  //////////////////////////////////////////////////////
  // LOAD USERS
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!notifications.length) return;

    const loadUsers = async () => {
      const map: any = {};

      await Promise.all(
        notifications.map(async (n) => {
          if (!map[n.fromUserId]) {
            const snap = await getDoc(doc(db, "users", n.fromUserId));
            if (snap.exists()) {
              map[n.fromUserId] = snap.data();
            }
          }
        })
      );

      setUsersMap(map);
    };

    loadUsers();
  }, [notifications]);

  //////////////////////////////////////////////////////
  // MESSAGE FORMAT
  //////////////////////////////////////////////////////
  const getMessage = (n: Notification) => {
    const name = usersMap[n.fromUserId]?.name || "Someone";

    switch (n.type) {
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented on your post`;
      case "follow":
        return `${name} followed you`;
      case "share":
        return `${name} shared your post`;
      default:
        return `${name} sent a notification`;
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="max-w-2xl mx-auto p-4 space-y-3">

      <h1 className="text-xl font-bold mb-4">🔔 Notifications</h1>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet</p>
      )}

      {notifications.map((n) => {
        const userData = usersMap[n.fromUserId];

        return (
          <div
            key={n.id}
            className={`p-3 rounded-lg flex items-center gap-3 ${
              n.read ? "bg-gray-100" : "bg-blue-50"
            }`}
          >
            <img
              src={userData?.photo || "/default-avatar.png"}
              className="w-10 h-10 rounded-full"
            />

            <div className="flex-1">
              <p className="text-sm text-black">
                {getMessage(n)}
              </p>

              <p className="text-xs text-gray-500">
                {n.createdAt?.toDate?.().toLocaleString?.() || "Just now"}
              </p>
            </div>
          </div>
        );
      })}
    </main>
  );
}