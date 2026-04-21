"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] =
    useState(false);

  const login = async () => {
    try {
      setLoading(true);

      const res =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = res.user;

      const snap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!snap.exists()) {
        alert("User profile not found");
        return;
      }

      const data = snap.data();

      // blocked user
      if (data.blocked === true) {
        alert("Account blocked");
        return;
      }

      // redirect by role
      if (
        data.role?.toLowerCase() ===
        "admin"
      ) {
        router.push("/admin");
        return;
      }

      if (
        data.role?.toLowerCase() ===
        "technician"
      ) {
        router.push("/technician");
        return;
      }

      router.push("/");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex justify-center items-center p-5">

      <div className="w-full max-w-md bg-[#111827] p-6 rounded-3xl">

        <h1 className="text-3xl font-bold text-center mb-6">
          🔐 Login
        </h1>

        <input
          placeholder="Email"
          className="w-full p-4 rounded-xl text-black mb-4"
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 rounded-xl text-black mb-4"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 p-4 rounded-xl font-bold"
        >
          {loading
            ? "Please wait..."
            : "LOGIN"}
        </button>

      </div>
    </main>
  );
}