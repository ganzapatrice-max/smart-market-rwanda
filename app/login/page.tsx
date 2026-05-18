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
  setDoc, // ✅ ADD THIS
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
      // ✅ ALWAYS USE SAME COLLECTION AS SIGNUP
      //////////////////////////////////////////////////////
      const ref = doc(db, "workers", user.uid);
      const snap = await getDoc(ref);

      //////////////////////////////////////////////////////
      // 🔥 AUTO FIX: CREATE PROFILE IF MISSING
      //////////////////////////////////////////////////////
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          name: user.email?.split("@")[0] || "User",
          email: user.email,
          role: "patient",

          phone: "",
          service: "",
          location: "",
          photo: "",

          verified: false,
          subscriptionActive: false,
          online: true,
          booked: false,

          createdAt: new Date(),
        });

        // reload profile
        const newSnap = await getDoc(ref);
        const data = newSnap.data();

        redirectUser(data);
        return;
      }

      const data = snap.data();

      //////////////////////////////////////////////////////
      // BLOCK CHECK
      //////////////////////////////////////////////////////
      if (data.blocked === true) {
        alert("Account blocked");
        return;
      }

      redirectUser(data);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // REDIRECT BY ROLE
  //////////////////////////////////////////////////////
  const redirectUser = (data: any) => {
    if (data.role === "admin") {
      router.push("/admin");
      return;
    }

    if (data.role === "technician") {
      router.push("/workers/technicians");
      return;
    }

    if (data.role === "patient") {
      router.push("/workers/patients");
      return;
    }

    router.push("/");
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

        {/* LOGIN */}
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