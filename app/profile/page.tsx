"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("technician");

  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setName(data.name || "");
        setLocation(data.location || "");
        setBio(data.bio || "");
        setRole(data.role || "technician");
      }
    });

    return () => unsub();
  }, [router]);

  //////////////////////////////////////////////////////
  // SAVE PROFILE
  //////////////////////////////////////////////////////
  const saveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      await setDoc(
        doc(db, "users", user.uid), // ✅ FIX HERE
        {
          name,
          location,
          bio,
          role,
          photo: "/default-avatar.png",
        },
        { merge: true }
      );

      alert("Profile saved!");
    } catch (error) {
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////////
  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <h1 className="text-3xl font-bold mb-6">✎ My Profile</h1>

      <Link
        href={`/profile/${user.uid}`}
        className="block w-full bg-indigo-600 py-4 rounded-xl text-center font-bold mb-4"
      >
        📸 My Posts
      </Link>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your Name"
        className="w-full p-4 rounded-xl text-black mb-4"
      />

      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className="w-full p-4 rounded-xl text-black mb-4"
      />

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="About you"
        className="w-full p-4 rounded-xl text-black mb-4"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-4 rounded-xl text-black mb-4"
      >
        <option value="technician">Technician</option>
        <option value="patient">Patient</option>
      </select>

      <button
        onClick={saveProfile}
        disabled={loading}
        className="w-full bg-green-600 p-4 rounded-xl font-bold mb-4"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>

      <button
        onClick={logout}
        className="w-full bg-red-600 p-4 rounded-xl font-bold"
      >
        Logout
      </button>
    </main>
  );
}