"use client";

import Link from "next/link";

const categories = [
  "Tutors",
  "Plumbers",
  "Electricians",
  "Cleaners",
  "House Helpers",
  "Builders",
  "Carpenters",
  "Painters",
  "Mechanics",
  "Drivers",
  "Gardeners",
  "Locksmiths",
  "Phone Repair",
  "Computer Repair",
  "TV Repair",
  "Babysitters",
  "Caregivers",
  "Security Guards",
  "Tailors",
  "Beauticians",
  "Barbers",
  "Chefs",
  "Photographers",
  "Videographers",
  "Doctors",
  "Nurses",
  "Lawyers",
  "Accountants",
  "Architects",
  "Engineers",
  "Farmers",
  "General Workers",
];

export default function WorkersPage() {
  return (
    <main className="min-h-screen bg-[#111b21] text-white p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-center text-green-500 mb-2">
          Smart Service Platform
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Choose the worker you need
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {categories.map((category) => (
            <Link
              key={category}
              href={`/workers/list?category=${encodeURIComponent(category)}`}
              className="bg-green-600 hover:bg-green-700 rounded-xl p-5 text-center font-semibold transition"
            >
              {category}
            </Link>
          ))}

        </div>

        <div className="mt-10 flex justify-center gap-4">

          <Link
            href="/workers/profile?role=patient"
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            Patient Profile
          </Link>

          <Link
            href="/workers/profile?role=technician"
            className="bg-green-700 px-6 py-3 rounded-xl"
          >
            Become a Worker
          </Link>

          <Link
            href="/"
            className="bg-gray-700 px-6 py-3 rounded-xl"
          >
            Back Home
          </Link>

        </div>

      </div>
    </main>
  );
}