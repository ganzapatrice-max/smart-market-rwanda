"use client";

import Link from "next/link";

export default function CompanyDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-700 text-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold">
            Company Dashboard
          </h1>
          <p className="text-blue-100 mt-2">
            Manage your company, jobs and applications.
          </p>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          <Link
            href="/company/profile"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Company Profile
            </h2>
            <p className="text-gray-500 mt-2">
              View and edit your company information.
            </p>
          </Link>

          <Link
            href="/company/jobs/create"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">📢</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Post a Job
            </h2>
            <p className="text-gray-500 mt-2">
              Create a new job opportunity.
            </p>
          </Link>

          <Link
            href="/company/jobs"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">💼</div>
            <h2 className="text-2xl font-bold text-gray-800">
              My Jobs
            </h2>
            <p className="text-gray-500 mt-2">
              Manage all posted jobs.
            </p>
          </Link>

          <Link
            href="/company/applications"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Applications
            </h2>
            <p className="text-gray-500 mt-2">
              Review job applications.
            </p>
          </Link>

          <Link
            href="/company/messages"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Messages
            </h2>
            <p className="text-gray-500 mt-2">
              Chat with applicants.
            </p>
          </Link>

          <Link
            href="/"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Home
            </h2>
            <p className="text-gray-500 mt-2">
              Return to the home page.
            </p>
          </Link>

        </div>
      </div>
    </main>
  );
}