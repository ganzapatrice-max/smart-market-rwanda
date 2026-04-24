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

  const [photo, setPhoto] = useState(""); // ✅ IMPORTANT

  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState(0);
const [following, setFollowing] = useState(0);

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
      setFollowers(data.followers || 0);
setFollowing(data.following || 0);

      if (snap.exists()) {
        const data = snap.data();

        setName(data.name || "");
        setLocation(data.location || "");
        setBio(data.bio || "");
        setRole(data.role || "technician");
        setPhoto(data.photo || "/default-avatar.png"); // ✅ LOAD PHOTO
      } else {
        setPhoto("/default-avatar.png");
      }
    });

    return () => unsub();
  }, [router]);

  //////////////////////////////////////////////////////
  // UPLOAD PHOTO (Cloudinary)
  //////////////////////////////////////////////////////
  const uploadPhoto = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "quickfix");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dmebligcw/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();

    setPhoto(result.secure_url); // ✅ REAL IMAGE URL
  };

  //////////////////////////////////////////////////////
  // SAVE PROFILE
  //////////////////////////////////////////////////////
  const saveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          location,
          bio,
          role,
          photo: photo || "/default-avatar.png", // ✅ SAVE UNIQUE PHOTO
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

      {/* ✅ PROFILE PHOTO */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={photo || "/default-avatar.png"}
          className="w-16 h-16 rounded-full object-cover"
        />
        <input type="file" onChange={uploadPhoto} />
      </div>

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