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
  const [photo, setPhoto] = useState(""); // ✅ no default
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

      const ref = doc(db, "workers", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const d = snap.data();

        setName(d.name || "");
        setPhone(d.phone || "");
        setLocation(d.location || "");
        setService(d.service || "");
        setBio(d.bio || "");
        setRole(d.role || "technician");
        setPhoto(d.photo || ""); // ✅ only real photo
        setVerified(d.verified || false);
      } else {
        setName(currentUser.email || "");
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
          photo, // ✅ only saved if exists
          verified,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMsg("✅ Profile saved");
      setEditing(false);
    } catch {
      setMsg("❌ Failed to save");
    }

    setSaving(false);
  };

  //////////////////////////////////////////////////////
  // VERIFIED
  //////////////////////////////////////////////////////
  const activateVerified = async () => {
    if (!user) return;

    const ok = confirm("Pay 5,000 Frw?");
    if (!ok) return;

    await updateDoc(doc(db, "workers", user.uid), {
      verified: true,
    });

    setVerified(true);
    setMsg("✔ Verified Activated");
  };

  //////////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////////
  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
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
    setMsg("✅ Photo uploaded");
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#07111a] text-white p-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="bg-[#0f172a] rounded-3xl p-6 text-center">

          {/* PHOTO */}
          {photo ? (
            <img
              src={photo}
              className="w-32 h-32 rounded-full object-cover border-4 border-green-500 mx-auto"
            />
          ) : (
            <label className="block bg-gray-700 p-6 rounded-xl cursor-pointer">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={uploadPhoto}
                hidden
              />
            </label>
          )}

          <h2 className="mt-4 text-xl font-bold">{name}</h2>
          <p className="text-gray-400">{user?.email}</p>

          {verified && (
            <div className="mt-2 bg-blue-600 px-3 py-1 rounded-full text-sm">
              ✔ Verified
            </div>
          )}

          <button
            onClick={() => setEditing(!editing)}
            className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-full"
          >
            Edit
          </button>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Link href="/" className="bg-cyan-600 py-2 rounded-full">Home</Link>
            <button onClick={logout} className="bg-red-600 py-2 rounded-full">Logout</button>
            <Link href="/post" className="bg-green-600 py-2 rounded-full">Post</Link>
            <Link href="/feed" className="bg-blue-600 py-2 rounded-full">Feed</Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 bg-[#0f172a] rounded-3xl p-6">

          {msg && <div className="mb-4 bg-green-700 p-3 rounded">{msg}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <input disabled={!editing} value={name} onChange={(e)=>setName(e.target.value)} className="p-3 bg-[#1e293b] rounded"/>
            <input disabled value={user?.email || ""} className="p-3 bg-[#111827] rounded"/>
            <input disabled={!editing} value={phone} onChange={(e)=>setPhone(e.target.value)} className="p-3 bg-[#1e293b] rounded"/>
            <input disabled={!editing} value={location} onChange={(e)=>setLocation(e.target.value)} className="p-3 bg-[#1e293b] rounded"/>
            <input disabled={!editing} value={service} onChange={(e)=>setService(e.target.value)} className="p-3 bg-[#1e293b] rounded"/>

            <select disabled={!editing} value={role} onChange={(e)=>setRole(e.target.value)} className="p-3 bg-[#1e293b] rounded">
              <option value="technician">Technician</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          <textarea
            disabled={!editing}
            value={bio}
            onChange={(e)=>setBio(e.target.value)}
            className="w-full mt-4 p-3 bg-[#1e293b] rounded"
          />

          <div className="grid grid-cols-3 gap-4 mt-6">
            <button onClick={saveProfile} className="bg-green-600 py-3 rounded">
              {saving ? "Saving..." : "Save"}
            </button>

            <button onClick={activateVerified} className="bg-blue-600 py-3 rounded">
              Verified
            </button>

            <Link href="/settings" className="bg-orange-500 text-center py-3 rounded">
              Settings
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}