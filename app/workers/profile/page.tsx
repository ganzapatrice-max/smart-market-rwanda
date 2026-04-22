"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] =
    useState("technician");

  //////////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (!currentUser) {
            window.location.href =
              "/login";
            return;
          }

          setUser(currentUser);

          const snap =
            await getDoc(
              doc(
                db,
                "workers",
                currentUser.uid
              )
            );

          if (snap.exists()) {
            const d =
              snap.data();

            setName(
              d.name || ""
            );
            setPhone(
              d.phone || ""
            );
            setLocation(
              d.location || ""
            );
            setService(
              d.service || ""
            );
            setBio(
              d.bio || ""
            );
            setRole(
              d.role ||
                "technician"
            );
          }
        }
      );

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // SAVE
  //////////////////////////////////////////////////////
  const saveProfile =
    async () => {
      if (!user) return;

      await setDoc(
        doc(
          db,
          "workers",
          user.uid
        ),
        {
          uid: user.uid,
          email:
            user.email,
          name,
          phone,
          location,
          service,
          bio,
          role,
        },
        { merge: true }
      );

      alert(
        "Saved Successfully ✅"
      );
    };

  //////////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////////
  const logout =
    async () => {
      await signOut(auth);
      window.location.href =
        "/login";
    };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#07111a] via-[#0f172a] to-black text-white px-4 py-10">

      <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="w-24 h-24 rounded-full bg-blue-600 mx-auto flex items-center justify-center text-4xl font-bold mb-4">
            {name
              ? name
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          <p className="text-gray-300 mt-1">
            Smart Market Rwanda
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          <input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="Full Name"
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <input
            value={
              user?.email ||
              ""
            }
            readOnly
            className="w-full p-4 rounded-2xl bg-gray-200 text-gray-700"
          />

          <input
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
            placeholder="Phone Number"
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <input
            value={location}
            onChange={(e) =>
              setLocation(
                e.target.value
              )
            }
            placeholder="Location"
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <input
            value={service}
            onChange={(e) =>
              setService(
                e.target.value
              )
            }
            placeholder="Skill / Service"
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <textarea
            rows={4}
            value={bio}
            onChange={(e) =>
              setBio(
                e.target.value
              )
            }
            placeholder="About You"
            className="w-full p-4 rounded-2xl bg-white text-black"
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value
              )
            }
            className="w-full p-4 rounded-2xl bg-white text-black"
          >
            <option value="technician">
              Technician
            </option>

            <option value="patient">
              Patient
            </option>
          </select>

        </div>

        {/* TOP 4 VERTICAL */}
        <div className="space-y-3 mt-8">

          <button
            onClick={
              saveProfile
            }
            className="w-full py-3 rounded-full bg-green-600 font-bold hover:scale-[1.02] transition"
          >
            Save Profile
          </button>

          {role ===
            "technician" && (
            <>
              <button className="w-full py-3 rounded-full bg-blue-600 font-bold hover:scale-[1.02] transition">
                Verified Badge
              </button>

              <button className="w-full py-3 rounded-full bg-yellow-500 text-black font-bold hover:scale-[1.02] transition">
                Gold Subscription
              </button>
            </>
          )}

          <button
            onClick={logout}
            className="w-full py-3 rounded-full bg-red-600 font-bold hover:scale-[1.02] transition"
          >
            Logout
          </button>
        </div>

        {/* 4 HORIZONTAL / GRID */}
        <div className="grid grid-cols-2 gap-3 mt-6">

          <Link
            href="/workers/technicians"
            className="py-3 rounded-2xl bg-purple-600 text-center font-bold hover:scale-[1.02] transition"
          >
            Technician
          </Link>

          <Link
            href="/workers/patients"
            className="py-3 rounded-2xl bg-pink-600 text-center font-bold hover:scale-[1.02] transition"
          >
            Patient
          </Link>

          <Link
            href="/"
            className="py-3 rounded-2xl bg-cyan-600 text-center font-bold hover:scale-[1.02] transition"
          >
            Home
          </Link>

          <Link
            href="/settings"
            className="py-3 rounded-2xl bg-gray-700 text-center font-bold hover:scale-[1.02] transition"
          >
            Settings
          </Link>

        </div>

        {/* FOOTER */}
        <p className="text-center text-gray-400 text-sm mt-8">
          © 2026 Smart Market Rwanda
        </p>

      </div>

    </main>
  );
}