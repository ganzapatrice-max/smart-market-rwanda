"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";

import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function FollowButton({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const [user, setUser] = useState<any>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // AUTH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // CHECK FOLLOW STATUS
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) return;

    const checkFollow = async () => {
      const ref = doc(
        db,
        "following",
        user.uid,
        "list",
        targetUserId
      );

      const snap = await getDoc(ref);
      setFollowing(snap.exists());
    };

    checkFollow();
  }, [user, targetUserId]);

  //////////////////////////////////////////////////////
  // FOLLOW / UNFOLLOW
  //////////////////////////////////////////////////////
  const toggleFollow = async () => {
    if (!user) return;

    setLoading(true);

    const myFollowRef = doc(
      db,
      "following",
      user.uid,
      "list",
      targetUserId
    );

    const theirFollowerRef = doc(
      db,
      "followers",
      targetUserId,
      "list",
      user.uid
    );

    try {
      if (following) {
        // ❌ UNFOLLOW
        await deleteDoc(myFollowRef);
        await deleteDoc(theirFollowerRef);

        await updateDoc(doc(db, "users", targetUserId), {
          followers: increment(-1),
        });

        await updateDoc(doc(db, "users", user.uid), {
          following: increment(-1),
        });

        setFollowing(false);
      } else {
        // ✅ FOLLOW
        await setDoc(myFollowRef, {
          createdAt: serverTimestamp(),
        });

        await setDoc(theirFollowerRef, {
          createdAt: serverTimestamp(),
        });

        // 🔔 NOTIFICATION
        if (targetUserId !== user.uid) {
          await addDoc(collection(db, "notifications"), {
            toUserId: targetUserId,
            fromUserId: user.uid,
            type: "follow",
            createdAt: serverTimestamp(),
            read: false,
          });
        }

        await updateDoc(doc(db, "users", targetUserId), {
          followers: increment(1),
        });

        await updateDoc(doc(db, "users", user.uid), {
          following: increment(1),
        });

        setFollowing(true);
      }
    } catch (err) {
      console.error("Follow error:", err);
    }

    setLoading(false);
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  if (!user || user.uid === targetUserId) return null;

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-5 py-2 rounded-full font-bold transition ${
        following
          ? "bg-gray-600 hover:bg-gray-500"
          : "bg-blue-600 hover:bg-blue-500"
      }`}
    >
      {loading ? "Loading..." : following ? "Following" : "Follow"}
    </button>

    
  );
}