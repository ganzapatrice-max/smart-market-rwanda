"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // LOGIN
  //////////////////////////////////////////////////////
  const login = async () => {
    try {
      if (!email || !password) {
        alert("Enter email and password");
        return;
      }

      setLoading(true);

      const res = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = res.user;

      //////////////////////////////////////////////////////
      // ✅ FIX: USE workers COLLECTION
      //////////////////////////////////////////////////////
      const snap = await getDoc(
        doc(db, "workers", user.uid)
      );

      if (!snap.exists()) {
        alert("User profile not found");
        return;
      }

      const data = snap.data();

      // blocked
      if (data.blocked === true) {
        alert("Account blocked");
        return;
      }

      //////////////////////////////////////////////////////
      // ROLE REDIRECT
      //////////////////////////////////////////////////////
      if (data.role === "admin") {
        router.push("/admin");
        return;
      }

      if (data.role === "technician") {
        router.push("/technician");
        return;
      }

      if (data.role === "patient") {
        router.push("/patient");
        return;
      }

      router.push("/");

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

      alert("Reset email sent 📩");

    } catch (error: any) {
      alert(error.message);
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-black text-white flex justify-center items-center p-5">

      <div className="w-full max-w-md bg-[#111827] p-6 rounded-3xl space-y-4">

        <h1 className="text-3xl font-bold text-center">
          🔐 Login
        </h1>

        {/* EMAIL */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl text-black"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-xl text-black"
        />

        {/* LOGIN BUTTON */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-blue-600 p-4 rounded-xl font-bold"
        >
          {loading ? "Please wait..." : "LOGIN"}
        </button>

        {/* SIGNUP */}
        <button
          onClick={() => router.push("/signup")}
          className="w-full bg-green-600 p-4 rounded-xl font-bold"
        >
          📝 No account? Create one
        </button>

        {/* RESET PASSWORD */}
        <div className="border-t border-gray-700 pt-4">

          <p className="text-sm text-gray-400 mb-2">
            Forgot password?
          </p>

          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full p-3 rounded-xl text-black mb-2"
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