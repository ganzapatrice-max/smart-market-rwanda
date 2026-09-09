"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function CompanyProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold">
            Company Profile
          </h1>
          <p className="text-blue-100 mt-2">
            Company ID: {id}
          </p>
        </div>
      </div>

      {/* Company Card */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

          <div className="h-64 bg-gray-300 flex items-center justify-center text-6xl">
            🏗️
          </div>

          <div className="p-8">

            <h2 className="text-3xl font-bold">
              Company Name
            </h2>

            <p className="text-gray-600 mt-4">
              Company description will appear here after loading it from
              Firestore.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-8">

              <div>
                <h3 className="font-bold">Industry</h3>
                <p>Construction</p>
              </div>

              <div>
                <h3 className="font-bold">Location</h3>
                <p>Rwanda</p>
              </div>

              <div>
                <h3 className="font-bold">Phone</h3>
                <p>+250 xxx xxx xxx</p>
              </div>

              <div>
                <h3 className="font-bold">Website</h3>
                <p>www.company.com</p>
              </div>

            </div>

            <div className="mt-10 flex gap-4">

              <Link
                href={`/company/${id}/jobs`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                View Jobs
              </Link>

              <Link
                href="/job"
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Back
              </Link>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}