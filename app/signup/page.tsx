"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  //////////////////////////////////////////////////////
  // SIGNUP (AUTO CREATE FULL PROFILE)
  //////////////////////////////////////////////////////
  const signup = async () => {
    try {
      if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
      }

      setLoading(true);

      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = res.user;

      //////////////////////////////////////////////////////
      // ✅ CREATE FULL PROFILE (PATIENT DEFAULT)
      //////////////////////////////////////////////////////
      await setDoc(doc(db, "workers", user.uid), {
        uid: user.uid,

        // BASIC
        name,
        email,
        role: "patient", // ✅ default role

        //////////////////////////////////////////////////////
        // PATIENT FIELDS
        //////////////////////////////////////////////////////
        phone: "",
        location: "",
        bio: "",
        photos: [], // problem images

        //////////////////////////////////////////////////////
        // TECHNICIAN FIELDS (PRE-CREATED 🔥)
        //////////////////////////////////////////////////////
        service: "",
        verified: false,
        subscriptionActive: false,

        //////////////////////////////////////////////////////
        // SYSTEM
        //////////////////////////////////////////////////////
        photo: "",
        online: true,
        blocked: false,

        //////////////////////////////////////////////////////
        // META
        //////////////////////////////////////////////////////
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      alert("Account created successfully!");

      // go to profile setup (better UX 🔥)
      router.push("/profile/edit");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // RESET PASSWORD
  //////////////////////////////////////////////////////
  const resetPassword = async () => {
    try {
      if (!resetEmail) {
        alert("Enter your email");
        return;
      }

      await sendPasswordResetEmail(auth, resetEmail);

      alert("Password reset email sent 📩");
    } catch (error: any) {
      alert(error.message);
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white flex justify-center items-center p-5">

      <div className="w-full max-w-md bg-[#111827] border border-gray-700 rounded-3xl p-6 shadow-2xl">

        <h1 className="text-3xl font-bold text-center">
          📝 Create Account
        </h1>

        <p className="text-center text-gray-400 mt-2 mb-6">
          Smart Market Rwanda
        </p>

        {/* NAME */}
        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-2xl bg-white text-black mb-4"
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-2xl bg-white text-black mb-4"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-2xl bg-white text-black mb-5"
        />

        {/* SIGNUP */}
        <button
          onClick={signup}
          disabled={loading}
          className="w-full bg-green-600 p-4 rounded-2xl font-bold"
        >
          {loading ? "Creating..." : "CREATE ACCOUNT"}
        </button>

        {/* LOGIN */}
        <button
          onClick={() => router.push("/login")}
          className="w-full mt-4 bg-blue-600 p-4 rounded-2xl font-bold"
        >
          🔐 Login
        </button>

        {/* RESET PASSWORD */}
        <div className="mt-6 border-t border-gray-700 pt-4">

          <p className="text-sm text-gray-400 mb-2">
            Forgot password?
          </p>

          <input
            type="email"
            placeholder="Enter email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-white text-black mb-3"
          />

          <button
            onClick={resetPassword}
            className="w-full bg-yellow-600 p-3 rounded-xl"
          >
            🔁 Reset Password
          </button>

        </div>

      </div>

    </main>
  );
}