"use client";

import Link from "next/link";

const categories = [
  { icon: "👨‍🏫", name: "Tutors", color: "bg-blue-100 text-blue-700" },
  { icon: "🔧", name: "Plumbers", color: "bg-green-100 text-green-700" },
  { icon: "⚡", name: "Electricians", color: "bg-yellow-100 text-yellow-700" },
  { icon: "🧹", name: "Cleaners", color: "bg-purple-100 text-purple-700" },
  { icon: "👩‍🍳", name: "House Helpers", color: "bg-pink-100 text-pink-700" },
  { icon: "🏗", name: "Builders", color: "bg-orange-100 text-orange-700" },
  { icon: "🪚", name: "Carpenters", color: "bg-amber-100 text-amber-700" },
  { icon: "🎨", name: "Painters", color: "bg-red-100 text-red-700" },
  { icon: "❄️", name: "AC Technicians", color: "bg-cyan-100 text-cyan-700" },
  { icon: "📺", name: "TV Repair", color: "bg-indigo-100 text-indigo-700" },
  { icon: "📱", name: "Phone Repair", color: "bg-lime-100 text-lime-700" },
  { icon: "💻", name: "Computer Repair", color: "bg-sky-100 text-sky-700" },
  { icon: "🚗", name: "Mechanics", color: "bg-gray-100 text-gray-700" },
  { icon: "🚕", name: "Drivers", color: "bg-teal-100 text-teal-700" },
  { icon: "🌿", name: "Gardeners", color: "bg-emerald-100 text-emerald-700" },
  { icon: "🔐", name: "Locksmiths", color: "bg-violet-100 text-violet-700" },
  { icon: "📷", name: "Photographers", color: "bg-fuchsia-100 text-fuchsia-700" },
  { icon: "🎥", name: "Videographers", color: "bg-rose-100 text-rose-700" },
  { icon: "👴", name: "Caregivers", color: "bg-indigo-100 text-indigo-700" },
  { icon: "👮", name: "Security Guards", color: "bg-slate-100 text-slate-700" },
  { icon: "👕", name: "Tailors", color: "bg-blue-100 text-blue-700" },
  { icon: "💄", name: "Beauticians", color: "bg-pink-100 text-pink-700" },
  { icon: "💇", name: "Barbers", color: "bg-red-100 text-red-700" },
  { icon: "🎵", name: "Musicians", color: "bg-purple-100 text-purple-700" },
  { icon: "📦", name: "Movers", color: "bg-orange-100 text-orange-700" },
  { icon: "🛒", name: "Delivery Workers", color: "bg-green-100 text-green-700" },
  { icon: "🏥", name: "Nurses", color: "bg-cyan-100 text-cyan-700" },
  { icon: "🩺", name: "Doctors", color: "bg-blue-100 text-blue-700" },
  { icon: "💊", name: "Pharmacists", color: "bg-lime-100 text-lime-700" },
  { icon: "📊", name: "Accountants", color: "bg-yellow-100 text-yellow-700" },
  { icon: "🏢", name: "Architects", color: "bg-stone-100 text-stone-700" },
  { icon: "📐", name: "Engineers", color: "bg-slate-100 text-slate-700" },
  { icon: "🌾", name: "Farmers", color: "bg-green-100 text-green-700" },
  { icon: "🐄", name: "Veterinarians", color: "bg-emerald-100 text-emerald-700" },
  { icon: "🚰", name: "Water Technicians", color: "bg-cyan-100 text-cyan-700" },
  { icon: "📡", name: "CCTV Installers", color: "bg-gray-100 text-gray-700" },
  { icon: "☀️", name: "Solar Installers", color: "bg-yellow-100 text-yellow-700" },
  { icon: "📶", name: "Network Technicians", color: "bg-indigo-100 text-indigo-700" },
  { icon: "🏠", name: "Real Estate Agents", color: "bg-teal-100 text-teal-700" },
  { icon: "🧑‍🏫", name: "Teachers", color: "bg-blue-100 text-blue-700" },
  { icon: "📖", name: "Translators", color: "bg-violet-100 text-violet-700" },
  { icon: "✍️", name: "Writers", color: "bg-rose-100 text-rose-700" },
  { icon: "🎤", name: "Event MCs", color: "bg-fuchsia-100 text-fuchsia-700" },
  { icon: "🎉", name: "Event Planners", color: "bg-pink-100 text-pink-700" },
  { icon: "👷", name: "General Workers", color: "bg-green-100 text-green-700" },
];

export default function WorkersPage() {
  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Find a Professional
          </h1>

          <p className="text-gray-500 mt-2 text-lg">
            Browse workers by category.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {categories.map((item) => (
          <Link
            key={item.name}
            href={`/workers/list?category=${encodeURIComponent(item.name)}`}
            className="block"
          >
            <div className="bg-white rounded-3xl shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-5">

                  <div
                    className={`w-20 h-20 rounded-3xl ${item.color} flex items-center justify-center text-4xl`}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {item.name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Find experienced {item.name.toLowerCase()} near you
                    </p>
                  </div>

                </div>

                <div className="text-4xl text-gray-400">
                  →
                </div>

              </div>

            </div>
          </Link>
        ))}

      </div>

      {/* Footer Buttons */}



        <div className="grid grid-cols-3 gap-4 mt-8">

          <Link
            href="/"
            className="bg-gray-800 text-white text-center py-4 rounded-xl font-semibold"
          >
            🏠 Home
          </Link>

          <Link
            href="/job"
            className="bg-green-700 text-white text-center py-4 rounded-xl font-semibold"
          >
            👷 Find Recruiters
          </Link>

          <Link
            href="/profile"
            className="bg-blue-700 text-white text-center py-4 rounded-xl font-semibold"
          >
            👤 My Profile
          </Link>

        <Link
          href="/workers/profile?role=technician"
          className="block text-center bg-black-600 text-white py-5 rounded-2xl text-xl font-bold"
        >
          Become a Worker
        </Link>

         <Link
            href="/servics/[id]"
            className="bg-green-700 text-white text-center py-4 rounded-xl font-semibold"
          >
          Services
          </Link>

          <Link
            href="/feed"
            className="bg-blue-700 text-white text-center py-4 rounded-xl font-semibold"
          >
            FEED
          </Link>


      </div>

    </main>
  );
}