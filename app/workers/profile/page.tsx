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

export default function WorkerProfilePage() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] =
    useState("technician");

  const [loading, setLoading] =
    useState(false);

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

          const ref = doc(
            db,
            "workers",
            currentUser.uid
          );

          const snap =
            await getDoc(ref);

          if (snap.exists()) {
            const data =
              snap.data();

            setName(
              data.name || ""
            );

            setPhone(
              data.phone || ""
            );

            setLocation(
              data.location || ""
            );

            setService(
              data.service || ""
            );

            setBio(
              data.bio || ""
            );

            setRole(
              data.role ||
                "technician"
            );
          }
        }
      );

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // SAVE PROFILE
  //////////////////////////////////////////////////////
  const saveProfile =
    async () => {
      if (!user) return;

      try {
        setLoading(true);

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
            updatedAt:
              new Date(),
          },
          { merge: true }
        );

        alert(
          "Profile Saved ✅"
        );
      } catch {
        alert(
          "Failed to save"
        );
      } finally {
        setLoading(false);
      }
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
  // BUTTON STYLE
  //////////////////////////////////////////////////////
  const box =
    "w-full rounded-full p-4 text-center font-bold text-white";

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#111b21] text-white px-4 py-8 flex justify-center">

      <div className="w-full max-w-xl bg-[#202c33] rounded-3xl p-6 shadow-2xl">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-8">
          ✎ My Profile
        </h1>

        {/* FORM */}
        <div className="space-y-4 mb-8">

          <input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="Full Name"
            className="w-full p-4 rounded-xl text-black"
          />

          <input
            value={
              user?.email ||
              ""
            }
            readOnly
            className="w-full p-4 rounded-xl bg-gray-300 text-black"
          />

          <input
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
            placeholder="Phone Number"
            className="w-full p-4 rounded-xl text-black"
          />

          <input
            value={location}
            onChange={(e) =>
              setLocation(
                e.target.value
              )
            }
            placeholder="Location"
            className="w-full p-4 rounded-xl text-black"
          />

          <input
            value={service}
            onChange={(e) =>
              setService(
                e.target.value
              )
            }
            placeholder="Service / Skill"
            className="w-full p-4 rounded-xl text-black"
          />

          <textarea
            value={bio}
            onChange={(e) =>
              setBio(
                e.target.value
              )
            }
            placeholder="About You"
            className="w-full p-4 rounded-xl text-black"
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value
              )
            }
            className="w-full p-4 rounded-xl text-black"
          >
            <option value="technician">
              Technician
            </option>

            <option value="patient">
              Patient
            </option>
          </select>
        </div>

        {/* BUTTONS VERTICAL */}
        <div className="space-y-4">

          <button
            onClick={
              saveProfile
            }
            disabled={
              loading
            }
            className={`${box} bg-green-600`}
          >
            {loading
              ? "Saving..."
              : "Save Profile"}
          </button>

          {role ===
            "technician" && (
            <>
              <button
                className={`${box} bg-blue-600`}
              >
                ✔️ Get Verified Badge
              </button>

              <button
                className={`${box} bg-yellow-500 text-black`}
              >
                👑 Gold Subscription
              </button>
            </>
          )}

          <Link
            href="/workers/technicians"
            className={`${box} bg-purple-600 block`}
          >
            Connect to Technician
          </Link>

          <Link
            href="/workers/patients"
            className={`${box} bg-pink-600 block`}
          >
            Connect to Patient
          </Link>

          <Link
            href="/workers"
            className={`${box} bg-gray-600 block`}
          >
            Go Back
          </Link>

          <Link
            href="/"
            className={`${box} bg-cyan-600 block`}
          >
            Home
          </Link>

          <Link
            href="/settings"
            className={`${box} bg-orange-500 block`}
          >
            Settings
          </Link>

          <button
            onClick={logout}
            className={`${box} bg-red-600`}
          >
            Logout
          </button>

        </div>

        <p className="text-center text-gray-400 mt-8 text-sm">
          © 2026 Smart Market Rwanda
        </p>

      </div>
    </main>
  );
}