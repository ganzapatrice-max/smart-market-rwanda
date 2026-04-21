"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";

import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [role, setRole] = useState("technician");

  //////////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser?.email) return;

        setUser(currentUser);

        const userRef = doc(
          db,
          "workers",
          currentUser.email
        );

        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();

          setName(data.name || "");
          setPhone(data.phone || "");
          setLocation(data.location || "");
          setService(data.service || "");
          setRole(data.role || "technician");
          setPhoto(data.photo || "");
        } else {
          setName(currentUser.email);
        }
      }
    );

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // SAVE PROFILE
  //////////////////////////////////////////////////////
  const saveProfile = async () => {
    if (!user?.email) return;

    await setDoc(
      doc(db, "workers", user.email),
      {
        photo,
        name,
        email: user.email,
        phone,
        location,
        service,
        role,
        online: true,
      },
      { merge: true }
    );

    alert("Profile Saved ✅");
  };

  //////////////////////////////////////////////////////
  // START PAYMENT + CHAT
  //////////////////////////////////////////////////////
  const startConsultationPayment =
    async () => {
      if (!user?.email) return;

      const technicianId =
        prompt(
          "Enter Technician Email"
        ) || "";

      if (!technicianId) return;

      const confirmed = confirm(
        "Consultation Fee: 2,000 Frw\n\nContinue?"
      );

      if (!confirmed) return;

      alert("Payment Successful ✅");

      const paymentId =
        Date.now().toString();

      //////////////////////////////////////////////////////
      // SAVE PAYMENT
      //////////////////////////////////////////////////////
      await setDoc(
        doc(db, "payments", paymentId),
        {
          userId: user.email,
          technicianId,
          amount: 2000,
          platformFee: 300,
          technicianAmount: 1700,
          type: "consultation",
          status: "paid",
          createdAt: serverTimestamp(),
        }
      );

      //////////////////////////////////////////////////////
      // TECHNICIAN WALLET
      //////////////////////////////////////////////////////
      await setDoc(
        doc(db, "wallets", technicianId),
        {
          userId: technicianId,
          balance: increment(1700),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      //////////////////////////////////////////////////////
      // PLATFORM PROFIT
      //////////////////////////////////////////////////////
      await setDoc(
        doc(db, "platform", "main"),
        {
          totalRevenue: increment(2000),
          totalCommission: increment(300),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      //////////////////////////////////////////////////////
      // OPEN CHAT
      //////////////////////////////////////////////////////
      window.location.href =
        `/chat/${encodeURIComponent(
          technicianId
        )}`;
    };

  //////////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////////
  const startGoldSubscription = async () => {
  if (!user?.email) return;

  const confirmed = confirm(
    "Gold Subscription = 10,000 Frw / Month\nContinue?"
  );

  if (!confirmed) return;

  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + 30);

  await setDoc(doc(db, "subscriptions", user.email), {
    userId: user.email,
    plan: "Gold",
    amount: 10000,
    status: "active",
    startDate: now,
    endDate: end,
    badge: "Gold",
    featured: true,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "platform", "main"),
    {
      totalRevenue: increment(10000),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  alert("Gold Activated 👑");
};
  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const activateVerified = async () => {
  if (!user?.email) return;

  const ok = confirm(
    "Verification Fee = 5,000 Frw. Continue?"
  );

  if (!ok) return;

  const license = prompt("Enter License Number");

  if (!license) return;

  await setDoc(doc(db, "verifications", user.email), {
    userId: user.email,
    status: "verified",
    amount: 5000,
    licenseId: license,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "workers", user.email),
    { verified: true },
    { merge: true }
  );

  await setDoc(
    doc(db, "platform", "main"),
    {
      totalRevenue: increment(5000),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  alert("Verified Activated ✔️");
};

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-[#111b21] flex justify-center items-center px-4 py-10">
      <div className="w-full max-w-lg bg-[#202c33] rounded-3xl shadow-2xl p-8">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold">
            My Profile
          </h1>
        </div>

        {/* PHOTO */}
        <div className="flex justify-center mb-8">
          <label className="cursor-pointer relative">

            <img
              src={
                photo ||
                "/default-avatar.png"
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
            />

            <div className="absolute bottom-0 right-0 bg-green-600 w-8 h-8 rounded-full flex items-center justify-center text-white">
              ✎
            </div>

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                setPhoto(
                  URL.createObjectURL(
                    e.target.files![0]
                  )
                )
              }
            />
          </label>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-5 text-white">

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Full Name"
            className="p-3 rounded-xl bg-[#2a3942]"
          />

          <input
            value={user?.email || ""}
            readOnly
            className="p-3 rounded-xl bg-[#111b21] text-gray-400"
          />

          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Phone"
            className="p-3 rounded-xl bg-[#2a3942]"
          />

          <input
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            placeholder="Location"
            className="p-3 rounded-xl bg-[#2a3942]"
          />

          <input
            value={service}
            onChange={(e) =>
              setService(e.target.value)
            }
            placeholder="Service"
            className="p-3 rounded-xl bg-[#2a3942]"
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            className="p-3 rounded-xl bg-[#2a3942]"
          >
            <option value="technician">
              Technician
            </option>

            <option value="patient">
              Patient
            </option>
          </select>
        </div>

        {/* BUTTONS */}
        <div className="mt-10 flex flex-col gap-4">

          <button
            onClick={saveProfile}
            className="bg-green-600 text-white py-4 px-5 rounded-xl"
          >
            Save Profile
          </button>

          <button
            onClick={
              startConsultationPayment
            }
            className="bg-blue-600 text-white py-4 px-5 rounded-xl"
          >
            Pay 2,000 Frw & Start Chat
          </button>
<button
  onClick={activateVerified}
  className="bg-blue-600 text-white py-4 px-5 rounded-xl w-full"
>
 ✔️ Get Verified Badge (5,000 Frw)
</button>
          <Link
            href="/workers/technicians"
            className="bg-purple-600 text-white py-4 px-5 rounded-xl"
          >
            Connect to Technician
          </Link>

          <Link
            href="/workers/patients"
            className="bg-pink-600 text-white py-4 px-5 rounded-xl"
          >
            Connect to Patient
          </Link>

          <Link
            href="/workers"
            className="bg-gray-600 text-white py-4 px-5 rounded-xl"
          >
            Go Back
          </Link>

          <Link
            href="/"
            className="bg-gray-700 text-white py-4 px-5 rounded-xl"
          >
            Home
          </Link>

          <Link
            href="/settings"
            className="bg-yellow-500 text-white py-4 px-5 rounded-xl"
          >
            Settings
          </Link>
<button
  onClick={startGoldSubscription}
  className="bg-yellow-500 text-white py-4 px-5 rounded-xl"
>
  👑 Activate Gold Subscription (10,000 Frw)
</button>
          <button
            onClick={logout}
            className="bg-red-600 text-white py-4 px-5 rounded-xl"
          >
            Logout
          </button>

        </div>
      </div>
    </main>
  );
}