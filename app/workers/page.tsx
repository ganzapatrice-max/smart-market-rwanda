"use client";

import Link from "next/link";

export default function WorkersPage() {
  return (
    <main className="min-h-screen bg-[#111b21] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#202c33] rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-3">
          Smart Service Platform
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Continue As
        </p>

        <div className="space-y-4">
          <Link
            href="/workers/profile?role=patient"
            className="block text-center bg-blue-600 py-4 rounded-xl"
          >
            Continue as Patient
          </Link>

          <Link
            href="/workers/profile?role=technician"
            className="block text-center bg-green-600 py-4 rounded-xl"
          >
            Continue as Technician
          </Link>

          <Link
            href="/"
            className="block text-center bg-gray-700 py-4 rounded-xl"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}