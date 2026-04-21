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
};

export default function PatientPage() {
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
      <main className="min-h-screen flex items-center justify-center bg-[#111b21] text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <div className="max-w-md mx-auto bg-[#202c33] p-6 rounded-2xl space-y-4">

        <h1 className="text-2xl font-bold text-center">
          Hello {user.name} 👋
        </h1>

        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Location: {user.location || "Not set"}</p>
        <p>Need Help: {user.service || "Not set"}</p>

        <div className="flex flex-col gap-3 pt-4">

          <Link
            href="/technicians"
            className="bg-green-600 p-3 rounded-xl text-center"
          >
            Find Technicians
          </Link>

          <Link
            href="/settings"
            className="bg-gray-700 p-3 rounded-xl text-center"
          >
            Settings
          </Link>

          <button
            onClick={logout}
            className="bg-red-600 p-3 rounded-xl"
          >
            Logout
          </button>

        </div>
      </div>
    </main>
  );
}