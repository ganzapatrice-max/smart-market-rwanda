"use client";

import { auth } from "../../lib/firebase";
import { signOut, deleteUser } from "firebase/auth";
import Link from "next/link";

export default function SettingsPage() {
  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const removeAccount = async () => {
    const user = auth.currentUser;

    if (!user) return;

    const ok = confirm(
      "Delete account permanently?"
    );

    if (!ok) return;

    await deleteUser(user);

    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-[#111b21] text-white flex justify-center items-center p-6">
      <div className="w-full max-w-md bg-[#202c33] p-8 rounded-2xl space-y-5">

        <h1 className="text-3xl font-bold text-center">
          Settings
        </h1>

        <Link
          href="/workers/profile"
          className="block w-full text-center bg-blue-600 py-4 rounded-xl"
        >
          Back to Profile
        </Link>

        <button
          onClick={logout}
          className="w-full bg-yellow-500 py-4 rounded-xl font-bold"
        >
          Logout
        </button>

        <button
          onClick={removeAccount}
          className="w-full bg-red-600 py-4 rounded-xl font-bold"
        >
          Delete Account
        </button>

        <Link
          href="/"
          className="block w-full text-center bg-gray-700 py-4 rounded-xl"
        >
          Home
        </Link>

      </div>
    </main>
  );
}