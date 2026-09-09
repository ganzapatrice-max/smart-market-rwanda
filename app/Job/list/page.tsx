"use client";

import { useSearchParams } from "next/navigation";

export default function JobsListPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-4">
        {category}
      </h1>

      <p className="text-gray-600 mb-8">
        Registered companies will appear here.
      </p>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold">
          No companies yet
        </h2>

        <p className="text-gray-500 mt-2">
          Register a company first to see it here.
        </p>
      </div>
    </main>
  );
}