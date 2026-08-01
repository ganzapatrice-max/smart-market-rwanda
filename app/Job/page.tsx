"use client";

import Link from "next/link";

const recruiters = [
  { icon: "🏗️", name: "Construction Companies", color: "border-orange-500" },
  { icon: "🏭", name: "Factories & Manufacturing", color: "border-blue-500" },
  { icon: "🏨", name: "Hotels & Restaurants", color: "border-pink-500" },
  { icon: "🏥", name: "Hospitals & Clinics", color: "border-green-500" },
  { icon: "🏫", name: "Schools & Universities", color: "border-purple-500" },
  { icon: "🏪", name: "Shops & Supermarkets", color: "border-yellow-500" },
  { icon: "🚚", name: "Transport & Logistics", color: "border-cyan-500" },
  { icon: "🌾", name: "Agriculture Companies", color: "border-lime-500" },
  { icon: "💻", name: "IT & Software Companies", color: "border-sky-500" },
  { icon: "🏦", name: "Banks & Financial Services", color: "border-emerald-500" },
  { icon: "📺", name: "Media & Advertising", color: "border-red-500" },
  { icon: "🏠", name: "Real Estate Companies", color: "border-teal-500" },
  { icon: "✈️", name: "Travel & Tourism", color: "border-violet-500" },
  { icon: "🛒", name: "Retail Businesses", color: "border-amber-500" },
  { icon: "⚖️", name: "Law Firms", color: "border-gray-500" },
  { icon: "📊", name: "Accounting Firms", color: "border-indigo-500" },
  { icon: "🏛️", name: "Government Institutions", color: "border-blue-700" },
  { icon: "🌍", name: "NGOs & Non-Profit", color: "border-green-700" },
  { icon: "👨‍💼", name: "Recruitment Agencies", color: "border-fuchsia-500" },
  { icon: "🏢", name: "Private Companies", color: "border-slate-500" },
  { icon: "📡", name: "Telecommunication Companies", color: "border-cyan-700" },
  { icon: "☀️", name: "Solar Companies", color: "border-yellow-600" },
  { icon: "🚰", name: "Water Companies", color: "border-blue-400" },
  { icon: "⚡", name: "Energy Companies", color: "border-orange-600" },
  { icon: "🚓", name: "Security Companies", color: "border-red-700" },
  { icon: "✂️", name: "Beauty Salons & Spas", color: "border-pink-600" },
  { icon: "🎤", name: "Event Management Companies", color: "border-purple-700" },
  { icon: "🎬", name: "Film & Production Companies", color: "border-indigo-600" },
  { icon: "🚘", name: "Car Dealers & Garages", color: "border-gray-700" },
  { icon: "📦", name: "Delivery Companies", color: "border-orange-700" },
];

export default function FindJobPage() {
  return (
    <main className="min-h-screen bg-slate-100">

      {/* Header */}
      <div className="sticky top-0 bg-white shadow-md z-20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-center text-slate-800">
            Find a Job
          </h1>

          <p className="text-center text-gray-500 mt-2 text-lg">
            Select the type of recruiter you want to work with.
          </p>
        </div>
      </div>

      {/* Recruiters */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">

          {recruiters.map((item) => (
            <Link
              key={item.name}
              href={`/jobs/list?category=${encodeURIComponent(item.name)}`}
              className={`block bg-white rounded-2xl border-l-8 ${item.color}
              hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center gap-6 px-8 py-7">

                <div className="text-5xl">
                  {item.icon}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {item.name}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Browse available jobs from {item.name}.
                  </p>
                </div>

                <div className="text-3xl text-gray-400">
                  →
                </div>

              </div>
            </Link>
          ))}

        </div>

        {/* Bottom Navigation */}

        <div className="grid grid-cols-3 gap-4 mt-8">

          <Link
            href="/"
            className="bg-gray-800 text-white text-center py-4 rounded-xl font-semibold"
          >
            🏠 Home
          </Link>

          <Link
            href="/workers"
            className="bg-green-700 text-white text-center py-4 rounded-xl font-semibold"
          >
            👷 Find Workers
          </Link>

          <Link
            href="/profile"
            className="bg-blue-700 text-white text-center py-4 rounded-xl font-semibold"
          >
            👤 My Profile
          </Link>

        </div>

      </div>

    </main>
  );
}