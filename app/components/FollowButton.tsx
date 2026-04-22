"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/app/lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
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
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // CHECK FOLLOW
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) return;

    const check = async () => {
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

    check();
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
        await deleteDoc(myFollowRef);
        await deleteDoc(theirFollowerRef);
        setFollowing(false);
      } else {
        await setDoc(myFollowRef, {
          createdAt: serverTimestamp(),
        });

        await setDoc(theirFollowerRef, {
          createdAt: serverTimestamp(),
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
      {loading
        ? "Loading..."
        : following
        ? "Following"
        : "Follow"}
    </button>
  );
}