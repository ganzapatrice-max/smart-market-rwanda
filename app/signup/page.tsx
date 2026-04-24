"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";

import {
  createUserWithEmailAndPassword,
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

  //////////////////////////////////////////////////////
  // SIGNUP FUNCTION
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
      // ✅ CREATE FIRESTORE PROFILE (FIXED)
      //////////////////////////////////////////////////////
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: name,
          email: email,
          role: "patient",
          blocked: false,
          createdAt: Date.now(),

          // ✅ IMPORTANT FIXES
          photo: "",          // no default image saved
          followers: 0,       // for counts
          following: 0,       // for counts
        }
      );

      alert("Account created successfully!");
      router.push("/login");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white flex justify-center items-center p-5">

      <div className="w-full max-w-md bg-[#111827] border border-gray-700 rounded-3xl p-6 shadow-2xl">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center">
          📝 Create Account
        </h1>

        <p className="text-center text-gray-400 mt-2 mb-6">
          Join Smart Market Rwanda
        </p>

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-2xl bg-white text-black mb-4 outline-none"
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-2xl bg-white text-black mb-4 outline-none"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-2xl bg-white text-black mb-5 outline-none"
        />

        {/* BUTTON */}
        <button
          onClick={signup}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-2xl font-bold transition"
        >
          {loading ? "Creating..." : "CREATE ACCOUNT"}
        </button>

        {/* LOGIN */}
        <button
          onClick={() => router.push("/login")}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl font-bold transition"
        >
          🔐 Already Have Account? Login
        </button>

      </div>

    </main>
  );
}