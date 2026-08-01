"use client";

import Link from "next/link";

const categories = [
  { name: "👨‍🏫 Tutors", color: "bg-blue-600 hover:bg-blue-700" },
  { name: "🔧 Plumbers", color: "bg-green-600 hover:bg-green-700" },
  { name: "⚡ Electricians", color: "bg-yellow-500 hover:bg-yellow-600 text-black" },
  { name: "🧹 Cleaners", color: "bg-purple-600 hover:bg-purple-700" },
  { name: "👩‍🍳 House Helpers", color: "bg-pink-600 hover:bg-pink-700" },
  { name: "🏗 Builders", color: "bg-orange-600 hover:bg-orange-700" },
  { name: "🪚 Carpenters", color: "bg-amber-700 hover:bg-amber-800" },
  { name: "🎨 Painters", color: "bg-red-600 hover:bg-red-700" },
  { name: "❄️ AC Technicians", color: "bg-cyan-600 hover:bg-cyan-700" },
  { name: "📺 TV Repair", color: "bg-indigo-600 hover:bg-indigo-700" },
  { name: "📱 Phone Repair", color: "bg-lime-600 hover:bg-lime-700" },
  { name: "💻 Computer Repair", color: "bg-sky-600 hover:bg-sky-700" },
  { name: "🚗 Mechanics", color: "bg-gray-700 hover:bg-gray-800" },
  { name: "🚕 Drivers", color: "bg-teal-600 hover:bg-teal-700" },
  { name: "🌿 Gardeners", color: "bg-emerald-600 hover:bg-emerald-700" },
  { name: "🔐 Locksmiths", color: "bg-violet-600 hover:bg-violet-700" },
  { name: "📷 Photographers", color: "bg-fuchsia-600 hover:bg-fuchsia-700" },
  { name: "🎥 Videographers", color: "bg-rose-600 hover:bg-rose-700" },
  { name: "👴 Caregivers", color: "bg-indigo-500 hover:bg-indigo-600" },
  { name: "👮 Security Guards", color: "bg-slate-700 hover:bg-slate-800" },
  { name: "👕 Tailors", color: "bg-blue-500 hover:bg-blue-600" },
  { name: "💄 Beauticians", color: "bg-pink-500 hover:bg-pink-600" },
  { name: "💇 Barbers", color: "bg-red-500 hover:bg-red-600" },
  { name: "🎵 Musicians", color: "bg-purple-500 hover:bg-purple-600" },
  { name: "📦 Movers", color: "bg-orange-500 hover:bg-orange-600" },
  { name: "🛒 Delivery Workers", color: "bg-green-500 hover:bg-green-600" },
  { name: "🏥 Nurses", color: "bg-cyan-500 hover:bg-cyan-600" },
  { name: "🩺 Doctors", color: "bg-blue-700 hover:bg-blue-800" },
  { name: "💊 Pharmacists", color: "bg-lime-500 hover:bg-lime-600" },
  { name: "📊 Accountants", color: "bg-yellow-600 hover:bg-yellow-700" },
  { name: "🏢 Architects", color: "bg-stone-600 hover:bg-stone-700" },
  { name: "📐 Engineers", color: "bg-slate-600 hover:bg-slate-700" },
  { name: "🌾 Farmers", color: "bg-green-700 hover:bg-green-800" },
  { name: "🐄 Veterinarians", color: "bg-emerald-700 hover:bg-emerald-800" },
  { name: "🚰 Water Technicians", color: "bg-cyan-700 hover:bg-cyan-800" },
  { name: "📡 CCTV Installers", color: "bg-gray-600 hover:bg-gray-700" },
  { name: "☀️ Solar Installers", color: "bg-yellow-400 hover:bg-yellow-500 text-black" },
  { name: "📶 Network Technicians", color: "bg-indigo-700 hover:bg-indigo-800" },
  { name: "🏠 Real Estate Agents", color: "bg-teal-700 hover:bg-teal-800" },
  { name: "🧑‍🏫 Teachers", color: "bg-blue-400 hover:bg-blue-500" },
  { name: "📖 Translators", color: "bg-violet-500 hover:bg-violet-600" },
  { name: "✍️ Writers", color: "bg-rose-500 hover:bg-rose-600" },
  { name: "🎤 Event MCs", color: "bg-fuchsia-500 hover:bg-fuchsia-600" },
  { name: "🎉 Event Planners", color: "bg-pink-700 hover:bg-pink-800" },
  { name: "📦 General Workers", color: "bg-green-800 hover:bg-green-900" },
];

export default function WorkersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111b21] to-[#0b141a] text-white p-4">

      <div className="max-w-lg mx-auto">

        <h1 className="text-4xl font-extrabold text-center text-green-400">
          Smart Service Platform
        </h1>

        <p className="text-center text-gray-300 mt-2 mb-6">
          Choose the worker you need
        </p>

        {/* Scrollable List */}
        <div className="bg-[#1f2c34] rounded-2xl p-4 shadow-xl h-[500px] overflow-y-auto space-y-3">

          {categories.map((item) => (
            <Link
              key={item.name}
              href={`/workers/list?category=${encodeURIComponent(item.name)}`}
              className={`${item.color} block w-full py-4 px-5 rounded-xl text-lg font-bold text-center transition-all duration-300 hover:scale-[1.03] shadow-lg`}
            >
              {item.name}
            </Link>
          ))}

        </div>

        <div className="mt-8 space-y-3">

          <Link
            href="/workers/profile?role=patient"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-center py-4 rounded-xl font-bold"
          >
            👤 Patient Profile
          </Link>

          <Link
            href="/workers/profile?role=technician"
            className="block w-full bg-green-600 hover:bg-green-700 text-center py-4 rounded-xl font-bold"
          >
            🛠 Become a Worker
          </Link>

          <Link
            href="/"
            className="block w-full bg-gray-700 hover:bg-gray-800 text-center py-4 rounded-xl font-bold"
          >
            🏠 Back Home
          </Link>

        </div>

      </div>

    </main>
  );
}