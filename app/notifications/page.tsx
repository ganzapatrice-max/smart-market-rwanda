"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type Notification = {
  id: string;
  toUserId: string;
  fromUserId: string;
  type: string;
  postId?: string;
  orderId?: string;
  amount?: number;
  createdAt?: any;
  read?: boolean;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});
  const [popup, setPopup] = useState<string | null>(null);
  const [prevCount, setPrevCount] = useState(0);

  //////////////////////////////////////////////////////
  // 🔊 SOUND
  //////////////////////////////////////////////////////
  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // MESSAGE FORMAT
  //////////////////////////////////////////////////////
  const getMessage = (n: Notification) => {
    const name = usersMap[n.fromUserId]?.name || "Someone";

    switch (n.type) {
      case "payment_confirmed":
        return `${name} confirmed your payment (${n.amount || 0} RWF)`;

      case "payment_received":
        return `You received ${n.amount || 0} RWF from ${name}`;

      case "payment_rejected":
        return `${name} rejected your payment`;

      case "new_order":
        return `${name} placed a new order (${n.amount || 0} RWF)`;

      case "like":
        return `${name} liked your post`;

      case "comment":
        return `${name} commented on your post`;

      default:
        return `${name} sent a notification`;
    }
  };

  //////////////////////////////////////////////////////
  // 🔥 LOAD NOTIFICATIONS (FIXED)
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

      // ✅ detect NEW notification safely
      if (snap.size > prevCount && data.length > 0) {
        playSound();
        setPopup(getMessage(data[0]));

        setTimeout(() => setPopup(null), 3000);
      }

      setPrevCount(snap.size);
      setNotifications(data);

      // ✅ mark as read (safe)
      data.forEach(async (n) => {
        if (!n.read) {
          await updateDoc(doc(db, "notifications", n.id), {
            read: true,
          });
        }
      });
    });

    return () => unsub();
  }, [user, prevCount]); // ✅ FIXED (removed usersMap)

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
  // CLICK HANDLER
  //////////////////////////////////////////////////////
  const handleClick = (n: Notification) => {
    if (n.orderId) {
      router.push(`/orders`);
      return;
    }

    if (n.postId) {
      router.push(`/post/${n.postId}`);
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="max-w-2xl mx-auto p-4 space-y-3">

      {popup && (
        <div className="fixed top-16 right-4 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
          {popup}
        </div>
      )}

      <h1 className="text-xl font-bold mb-4">🔔 Notifications</h1>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet</p>
      )}

      {notifications.map((n) => {
        const userData = usersMap[n.fromUserId];

        return (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer ${
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