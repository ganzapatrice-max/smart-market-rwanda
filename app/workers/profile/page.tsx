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
      }
    });

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // SAVE
  //////////////////////////////////////////////////////
  const saveProfile = async () => {
    if (!user) return;

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
      },
      { merge: true }
    );

    alert("Saved Successfully ✅");
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
    <main className="min-h-screen flex bg-[#07111a] text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-green-900 p-6 flex flex-col justify-between">

        <div>
          <div className="text-2xl font-bold mb-10">
            Smart Market Rwanda
          </div>

          <div className="flex flex-col gap-4">

            <div className="bg-green-700 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
              <span>User Profile</span>
            </div>

            <Link href="#" className="p-3 rounded-lg hover:bg-green-800">
              My Profile
            </Link>

            <Link href="#" className="p-3 rounded-lg hover:bg-green-800">
              Gold Subscription
            </Link>

            <Link href="/" className="p-3 rounded-lg hover:bg-green-800">
              Home
            </Link>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-green-700 p-3 rounded-lg hover:bg-green-800"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 p-8">

        {/* TOP NAV */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            Smart Market Rwanda
          </h1>

          <div className="text-green-400 font-semibold">
            Trusted Platform rw
          </div>
        </div>

        {/* ACTION CARDS */}
        <div className="grid grid-cols-4 gap-6 mb-8">

          <div className="bg-[#0f172a] p-6 rounded-xl text-center">
            Dashboard
          </div>

          <Link
            href="/workers/technicians"
            className="bg-[#0f172a] p-6 rounded-xl text-center"
          >
            Find Technicians
          </Link>

          <Link
            href="/workers/patients"
            className="bg-[#0f172a] p-6 rounded-xl text-center"
          >
            Find Patients
          </Link>

          <div className="bg-[#0f172a] p-6 rounded-xl text-center">
            Verified Badge
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-[#0f172a] p-8 rounded-2xl">

          <h2 className="text-2xl font-bold mb-2">
            My Profile
          </h2>

          <p className="text-gray-400 mb-6">
            Manage your Smart Market account
          </p>

          {/* FORM GRID */}
          <div className="grid grid-cols-2 gap-6">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="p-4 rounded-lg bg-[#1e293b]"
            />

            <input
              value={user?.email || ""}
              readOnly
              className="p-4 rounded-lg bg-[#1e293b] text-gray-400"
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="p-4 rounded-lg bg-[#1e293b]"
            />

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="p-4 rounded-lg bg-[#1e293b]"
            />

            <input
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Skill / Service"
              className="p-4 rounded-lg bg-[#1e293b]"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-4 rounded-lg bg-[#1e293b]"
            >
              <option value="technician">Technician</option>
              <option value="patient">Patient</option>
            </select>

          </div>

          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="About You"
            className="w-full mt-6 p-4 rounded-lg bg-[#1e293b]"
          />

          {/* SAVE BUTTON */}
          <button
            onClick={saveProfile}
            className="mt-6 bg-green-600 px-6 py-3 rounded-lg font-bold hover:bg-green-700"
          >
            Save Profile
          </button>

        </div>

      </section>
    </main>
  );
}