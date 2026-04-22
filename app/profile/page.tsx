"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();

  const [uid, setUid] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("technician");

  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUid(user.uid);

      const ref = doc(db, "users", user.uid);
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
    try {
      setLoading(true);

      await setDoc(
        doc(db, "users", uid),
        {
          name,
          location,
          bio,
          role,
        },
        { merge: true }
      );

      alert("Profile saved!");
    } catch (error) {
      alert("Failed");
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

  return (
    <main className="min-h-screen bg-black text-white p-5">

      <h1 className="text-3xl font-bold mb-6">
        ✎ My Profile
      </h1>

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

      {/* Technician only */}
      {role === "technician" && (
        <>
          <button className="w-full bg-blue-600 p-4 rounded-xl font-bold mb-4">
            ✔️ Get Verified Badge (5,000 Frw)
          </button>

          <button className="w-full bg-yellow-500 text-black p-4 rounded-xl font-bold mb-4">
            👑 Activate Gold Subscription (10,000 Frw)
          </button>
        </>
      )}

      <Link
        href="/technicians"
        className="block w-full bg-purple-600 p-4 rounded-xl font-bold text-center mb-4"
      >
        Connect to Technician
      </Link>

      <Link
        href="/patients"
        className="block w-full bg-pink-600 p-4 rounded-xl font-bold text-center mb-4"
      >
        Connect to Patient
      </Link>

      <Link
        href="/"
        className="block w-full bg-gray-700 p-4 rounded-xl font-bold text-center mb-4"
      >
        Home
      </Link>

      <button
        onClick={logout}
        className="w-full bg-red-600 p-4 rounded-xl font-bold"
      >
        Logout
      </button>

    </main>
  );
}