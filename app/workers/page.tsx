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

      {/* Space so last card isn't hidden behind footer */}
<div className="h-40" />

{/* Fixed Bottom Footer */}
<footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50">
  <div className="max-w-6xl mx-auto grid grid-cols-3 md:grid-cols-6 gap-2 p-3">

    <Link
      href="/"
      className="flex flex-col items-center justify-center rounded-xl bg-gray-800 text-white py-3 hover:bg-gray-900 transition"
    >
      <span className="text-2xl">🏠</span>
      <span className="text-xs font-semibold">Home</span>
    </Link>

    <Link
      href="/jobs"
      className="flex flex-col items-center justify-center rounded-xl bg-indigo-600 text-white py-3 hover:bg-indigo-700 transition"
    >
      <span className="text-2xl">💼</span>
      <span className="text-xs font-semibold">Recruiters</span>
    </Link>

    <Link
      href="/workers/profile"
      className="flex flex-col items-center justify-center rounded-xl bg-blue-600 text-white py-3 hover:bg-blue-700 transition"
    >
      <span className="text-2xl">👤</span>
      <span className="text-xs font-semibold">Profile</span>
    </Link>

    <Link
      href="/workers/profile?role=technician"
      className="flex flex-col items-center justify-center rounded-xl bg-black text-white py-3 hover:bg-gray-900 transition"
    >
      <span className="text-2xl">👷</span>
      <span className="text-xs font-semibold">Become Worker</span>
    </Link>

    <Link
      href="/services"
      className="flex flex-col items-center justify-center rounded-xl bg-green-600 text-white py-3 hover:bg-green-700 transition"
    >
      <span className="text-2xl">🛠</span>
      <span className="text-xs font-semibold">Services</span>
    </Link>

    <Link
      href="/feed"
      className="flex flex-col items-center justify-center rounded-xl bg-pink-600 text-white py-3 hover:bg-pink-700 transition"
    >
      <span className="text-2xl">📰</span>
      <span className="text-xs font-semibold">Feed</span>
    </Link>

  </div>
</footer>
    </main>
  );
}