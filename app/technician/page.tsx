"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserData = {
  name: string;
  email: string;
  role: string;
  photo?: string;
  location?: string;
  service?: string;
  online?: boolean;
};

export default function TechnicianPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser?.email) {
        router.push("/login");
        return;
      }

      const snap = await getDoc(
        doc(db, "users", currentUser.email)
      );

      if (snap.exists()) {
        setUser(snap.data() as UserData);
      }
    };

    loadUser();
  }, [router]);

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) {
    return (
      <main className="min-h-screen flex justify-center items-center bg-[#111b21] text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <div className="max-w-md mx-auto bg-[#202c33] rounded-2xl p-6 space-y-4 shadow-xl">

        <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto overflow-hidden">
          {user.photo ? (
            <img
              src={user.photo}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <h1 className="text-2xl font-bold text-center">
          Hello {user.name} 👋
        </h1>

        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Location: {user.location || "Not set"}</p>
        <p>Skill: {user.service || "Not set"}</p>

        <p className="text-green-400">
          🟢 Online
        </p>

        <div className="flex flex-col gap-3 pt-4">

          <Link
            href="/technician/patients"
            className="bg-green-600 p-3 rounded-xl text-center hover:bg-green-700"
          >
            Connect to Patients
          </Link>

          <Link
            href="/technician/portfolio"
            className="bg-blue-600 p-3 rounded-xl text-center hover:bg-blue-700"
          >
            Your Portfolio
          </Link>

          <Link
            href="/technician/post-service"
            className="bg-purple-600 p-3 rounded-xl text-center hover:bg-purple-700"
          >
            Post Service
          </Link>

          <Link
            href="/technician/settings"
            className="bg-gray-700 p-3 rounded-xl text-center hover:bg-gray-800"
          >
            Settings
          </Link>

          <button
            onClick={logout}
            className="bg-red-600 p-3 rounded-xl hover:bg-red-700"
          >
            Logout
          </button>

        </div>
      </div>
    </main>
  );
}