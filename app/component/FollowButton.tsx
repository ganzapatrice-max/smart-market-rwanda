"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function FollowButton({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const [user, setUser] = useState<any>(null);
  const [following, setFollowing] = useState(false);

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

    if (following) {
      await deleteDoc(myFollowRef);
      await deleteDoc(theirFollowerRef);
      setFollowing(false);
    } else {
      await setDoc(myFollowRef, { createdAt: Date.now() });
      await setDoc(theirFollowerRef, { createdAt: Date.now() });
      setFollowing(true);
    }
  };

  if (!user || user.uid === targetUserId) return null;

  return (
    <button
      onClick={toggleFollow}
      className={`px-4 py-2 rounded-full font-bold ${
        following
          ? "bg-gray-600"
          : "bg-blue-600"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}