"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";

import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("technician");
  const [photo, setPhoto] = useState("");
  const [verified, setVerified] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  //////////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);

      const snap = await getDoc(doc(db, "workers", currentUser.uid));

      if (snap.exists()) {
        const d = snap.data();

        setName(d.name || "");
        setPhone(d.phone || "");
        setLocation(d.location || "");
        setService(d.service || "");
        setBio(d.bio || "");
        setRole(d.role || "technician");
        setPhoto(d.photo || "");
        setVerified(d.verified || false);
      }
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // SAVE PROFILE
  //////////////////////////////////////////////////////
  const saveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setMsg("");

      await setDoc(
        doc(db, "workers", user.uid),
        {
          uid: user.uid,
          email: user.email,
          name,
          phone,
          location,
          service,
          bio,
          role,
          photo,
          verified,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMsg("✅ Profile saved");
      setEditing(false);
    } catch {
      setMsg("❌ Failed");
    }

    setSaving(false);
  };

  //////////////////////////////////////////////////////
  // PHOTO UPLOAD
  //////////////////////////////////////////////////////
  const uploadPhoto = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg("Uploading...");

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "quickfix");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dmebligcw/image/upload",
      { method: "POST", body: data }
    );

    const result = await res.json();

    setPhoto(result.secure_url);
    setMsg("✅ Photo updated");
  };

  //////////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////////
  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  //////////////////////////////////////////////////////
  // VERIFIED
  //////////////////////////////////////////////////////
  const activateVerified = async () => {
    await updateDoc(doc(db, "workers", user.uid), {
      verified: true,
    });
    setVerified(true);
  };

  if (!user) return <p className="text-white p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-[#07111a] text-white pb-24">

      {/* 🔝 TOP NAV */}
      <div className="bg-green-600 px-6 py-5 flex justify-between items-center shadow-lg">
        <h1 className="font-extrabold text-2xl">
          Smart Market Rwanda
        </h1>

        <div className="flex gap-6 text-xl">
          <Link href="/">🏠</Link>
          <Link href="/feed">📰</Link>
          <Link href="/post">➕</Link>
        </div>
      </div>

      <div className="p-6 grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="bg-[#0f172a] p-6 rounded-2xl text-center">

          {photo ? (
            <img
              src={photo}
              className="w-28 h-28 rounded-full mx-auto object-cover mb-3"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-700 mx-auto flex items-center justify-center">
              No Photo
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
            className="mb-3"
          />

          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>

          {verified && (
            <p className="text-blue-400 mt-2">✔ Verified</p>
          )}

          <button
            onClick={() => setEditing(!editing)}
            className="bg-yellow-500 text-black px-4 py-2 rounded mt-4"
          >
            Edit Profile
          </button>

          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded mt-2"
          >
            Logout
          </button>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 bg-[#0f172a] p-6 rounded-2xl">

          {msg && <p className="mb-3">{msg}</p>}

          <div className="grid grid-cols-2 gap-3">

            <input disabled={!editing} value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="p-3 rounded bg-[#1e293b]" />

            <input disabled={!editing} value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="p-3 rounded bg-[#1e293b]" />

            <input disabled={!editing} value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="p-3 rounded bg-[#1e293b]" />

            <input disabled={!editing} value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Service"
              className="p-3 rounded bg-[#1e293b]" />

            <select disabled={!editing}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-3 rounded bg-[#1e293b] col-span-2">
              <option value="technician">Technician</option>
              <option value="patient">Patient</option>
            </select>

          </div>

          <textarea disabled={!editing}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
            className="w-full mt-4 p-3 rounded bg-[#1e293b]" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

  <button
    onClick={saveProfile}
    disabled={saving}
    className="bg-green-600 hover:bg-green-700 transition p-3 rounded-lg font-semibold"
  >
    {saving ? "Saving..." : "💾 Save"}
  </button>

  <button
    onClick={activateVerified}
    className="bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg font-semibold"
  >
    ✔ Verified
  </button>

  <Link
    href="/workers/technicians"
    className="bg-purple-600 hover:bg-purple-700 transition p-3 rounded-lg text-center font-semibold"
  >
    🔧 Find Tech
  </Link>

  <Link
    href="/workers/patients"
    className="bg-emerald-600 hover:bg-emerald-700 transition p-3 rounded-lg text-center font-semibold"
  >
    🩺 Find Patient
  </Link>

</div>
          

          </div>

        </div>

      {/* 🔻 BOTTOM NAV TEXT */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-center py-3 text-sm text-gray-300 border-t border-white/10">
        Thank you for chosing good platform smart market Rwanda. start to day and fly later.
      </div>

    </main>
  );
}