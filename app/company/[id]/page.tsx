"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CompanyProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const loadCompany = async () => {
      const snap = await getDoc(doc(db, "companies", id as string));

      if (snap.exists()) {
        setCompany({
          id: snap.id,
          ...snap.data(),
        });
      }
    };

    loadCompany();

    const q = query(
      collection(db, "jobs"),
      where("companyId", "==", id)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setJobs(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, [id]);

  if (!company) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-32">

      {/* Cover */}
      <div className="h-48 bg-gradient-to-r from-blue-700 to-indigo-700" />

      <div className="max-w-5xl mx-auto px-5">

        {/* Company Card */}
        <div className="-mt-20 bg-white rounded-3xl shadow-lg p-6">

          <div className="flex flex-col md:flex-row gap-6">

            <img
              src={company.logo || "/company.png"}
              className="w-40 h-40 rounded-3xl object-cover border"
            />

            <div className="flex-1">

              <h1 className="text-4xl font-bold text-gray-900">
                {company.name}
              </h1>

              <p className="text-gray-500 mt-2">
                {company.industry}
              </p>

              <p className="mt-5 text-gray-700 whitespace-pre-wrap">
                {company.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

                <div>
                  <p className="text-gray-500 text-sm">
                    Location
                  </p>

                  <p className="font-semibold">
                    {company.location}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Phone
                  </p>

                  <p className="font-semibold">
                    {company.phone}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Email
                  </p>

                  <p className="font-semibold break-all">
                    {company.email}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Website
                  </p>

                  <a
                    href={company.website}
                    target="_blank"
                    className="text-blue-600"
                  >
                    Visit
                  </a>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Jobs */}

        <div className="mt-10">

          <h2 className="text-3xl font-bold mb-5">
            Available Jobs
          </h2>

          {jobs.length === 0 && (
            <div className="bg-white rounded-2xl p-8 shadow text-center text-gray-500">
              No job vacancies available.
            </div>
          )}

          <div className="space-y-4">

            {jobs.map((job) => (

              <div
                key={job.id}
                className="bg-white rounded-2xl shadow p-6"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <h3 className="text-2xl font-bold">
                      {job.title}
                    </h3>

                    <p className="text-gray-500 mt-1">
                      {job.location}
                    </p>

                    <p className="mt-4 text-gray-700">
                      {job.description}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      router.push(`/apply/${job.id}`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
                  >
                    Apply
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </main>
  );
}