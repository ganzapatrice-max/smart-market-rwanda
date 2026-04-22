"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("technician");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);

      const snap = await getDoc(doc(db, "workers", u.uid));

      if (snap.exists()) {
        const d = snap.data();
        setName(d.name || "");
        setPhone(d.phone || "");
        setLocation(d.location || "");
        setService(d.service || "");
        setBio(d.bio || "");
        setRole(d.role || "technician");
      }
    });

    return () => unsub();
  }, []);

  const saveProfile = async () => {
    if (!user) return;

    await setDoc(
      doc(db, "workers", user.uid),
      {
        name,
        phone,
        location,
        service,
        bio,
        role,
        email: user.email,
      },
      { merge: true }
    );

    alert("Saved ✅");
  };

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const btn =
    "block w-full text-center py-4 rounded-full font-semibold transition hover:scale-[1.02]";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#07111a] via-[#0f172a] to-black text-white px-4 py-10">

      <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">

        {/* Top */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-blue-600 mx-auto flex items-center justify-center text-4xl font-bold mb-4">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>

          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-300 mt-1">
            Manage your Smart Market account
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <input
            value={user?.email || ""}
            readOnly
            className="w-full p-4 rounded-2xl bg-gray-200 text-gray-700"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <input
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Skill / Service"
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="About You"
            rows={4}
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white text-black"
          >
            <option value="technician">Technician</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="space-y-4 mt-8">

          <button
            onClick={saveProfile}
            className={`${btn} bg-green-600`}
          >
            Save Profile
          </button>

          {role === "technician" && (
            <>
              <button className={`${btn} bg-blue-600`}>
                Verified Badge
              </button>

              <button className={`${btn} bg-yellow-500 text-black`}>
                Gold Subscription
              </button>
            </>
          )}

          <Link
            href="/workers/technicians"
            className={`${btn} bg-purple-600`}
          >
            Find Technicians
          </Link>

          <Link
            href="/workers/patients"
            className={`${btn} bg-pink-600`}
          >
            Find Patients
          </Link>

          <Link
            href="/workers"
            className={`${btn} bg-gray-600`}
          >
            Dashboard
          </Link>

          <Link
            href="/"
            className={`${btn} bg-cyan-600`}
          >
            Home
          </Link>

          <button
            onClick={logout}
            className={`${btn} bg-red-600`}
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}