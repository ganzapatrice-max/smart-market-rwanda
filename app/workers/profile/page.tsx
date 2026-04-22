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
        setPhoto(d.photo || "");
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
          photo,
          verified,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMsg("✅ Everything saved successfully");
      setEditing(false);
    } catch (error) {
      setMsg("❌ Failed to save");
    }

    setSaving(false);
  };

  //////////////////////////////////////////////////////
  // VERIFIED BADGE
  //////////////////////////////////////////////////////
  const activateVerified = async () => {
    if (!user) return;

    const ok = confirm("Pay 5,000 Frw for Verified Badge?");
    if (!ok) return;

    await updateDoc(doc(db, "workers", user.uid), {
      verified: true,
    });

    setVerified(true);
    setMsg("✔️ Verified Badge Activated");
  };

  //////////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////////
  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#07111a] text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* TOP */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Smart Market Rwanda</h1>
          <p className="text-green-400 font-semibold">Trusted Platform RW</p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* LEFT CARD */}
          <div className="bg-[#0f172a] rounded-2xl p-6">

            <div className="flex flex-col items-center text-center">

              <img
                src={photo || "/default-avatar.png"}
                className="w-28 h-28 rounded-full object-cover border-4 border-green-500"
              />

              <h2 className="mt-4 text-xl font-bold">
                {name || "User"}
              </h2>

              <p className="text-gray-400 text-sm">{user?.email}</p>

              {verified && (
                <div className="mt-3 bg-blue-600 px-4 py-2 rounded-full text-sm">
                  ✔ Verified Badge
                </div>
              )}

              <button
                onClick={() => setEditing(!editing)}
                className="mt-4 bg-yellow-500 text-black px-5 py-2 rounded-full font-bold"
              >
                ✏ Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Link
                href="/workers/technicians"
                className="bg-purple-600 text-center py-3 rounded-xl"
              >
                Technicians
              </Link>

              <Link
                href="/workers/patients"
                className="bg-pink-600 text-center py-3 rounded-xl"
              >
                Patients
              </Link>

              <Link
                href="/"
                className="bg-cyan-600 text-center py-3 rounded-xl"
              >
                Home
              </Link>

              <button
                onClick={logout}
                className="bg-red-600 py-3 rounded-xl"
              >
                Logout
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-2 bg-[#0f172a] rounded-2xl p-6">

            <h2 className="text-2xl font-bold mb-5">
              My Profile
            </h2>

            {msg && (
              <div className="mb-4 bg-green-700 p-3 rounded-xl">
                {msg}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">

              <input
                disabled={!editing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="p-4 rounded-xl bg-[#1e293b]"
              />

              <input
                disabled
                value={user?.email || ""}
                className="p-4 rounded-xl bg-[#111827]"
              />

              <input
                disabled={!editing}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="p-4 rounded-xl bg-[#1e293b]"
              />

              <input
                disabled={!editing}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="p-4 rounded-xl bg-[#1e293b]"
              />

              <input
                disabled={!editing}
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Service / Skill"
                className="p-4 rounded-xl bg-[#1e293b]"
              />

              <select
                disabled={!editing}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="p-4 rounded-xl bg-[#1e293b]"
              >
                <option value="technician">Technician</option>
                <option value="patient">Patient</option>
              </select>



              <input
  disabled={!editing}
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg("Uploading photo...");

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

    setPhoto(result.secure_url);
    setMsg("✅ Photo uploaded successfully");
  }}
  className="p-4 rounded-xl md:col-span-2 bg-[#1e293b]"
/>
            </div>

            <textarea
              disabled={!editing}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="About You"
              rows={4}
              className="w-full mt-4 p-4 rounded-xl bg-[#1e293b]"
            />
<div className="grid md:grid-cols-3 gap-4 mt-6">

  {/* SAVE */}
  <button
    onClick={saveProfile}
    disabled={saving}
    className="bg-green-600 py-4 rounded-xl font-bold"
  >
    {saving ? "Saving..." : "Save Profile"}
  </button>

  {/* SETTINGS */}
  <Link
    href="/settings"
    className="bg-orange-500 text-center py-4 rounded-xl font-bold"
  >
    Settings
  </Link>

  {/* TECHNICIAN ONLY */}
  {role === "technician" ? (
    <>
      <button
        onClick={activateVerified}
        className="bg-blue-600 py-4 rounded-xl font-bold"
      >
        ✔ Verified Badge
      </button>

      <Link
        href="/subscriptions"
        className="bg-yellow-500 text-center py-4 rounded-xl font-bold text-black"
      >
        👑 Subscription
      </Link>
    </>
  ) : (
    <>
      {/* PATIENT ONLY */}
      <Link
        href="/workers/technicians"
        className="bg-purple-600 text-center py-4 rounded-xl font-bold"
      >
        Find Technician
      </Link>

      <div className="bg-gray-700 py-4 rounded-xl text-center font-bold">
        Patient Account
      </div>
    </>
  )}

</div>

          </div>

        </div>
      </div>
    </main>
  );
}