
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
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
          <p className="font-semibold text-slate-200">
            Loading company profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pb-32 text-slate-100">
      {/* Cover */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-950">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent_45%)]" />
        <div className="relative mx-auto flex h-full max-w-5xl items-end px-5 pb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
              Company profile
            </p>
            <p className="mt-2 text-sm text-blue-100/80">
              Discover the company and explore career opportunities
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-5">
        {/* Company Card */}
        <div className="-mt-8 relative rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl shadow-black/30 sm:-mt-12 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <img
              src={company.logo || "/company.png"}
              alt={`${company.name || "Company"} logo`}
              className="h-32 w-32 rounded-2xl border border-slate-600 bg-slate-800 object-cover shadow-lg sm:h-40 sm:w-40"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {company.name}
                  </h1>

                  <p className="mt-2 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300">
                    {company.industry || "Company"}
                  </p>
                </div>
              </div>

              <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-300">
                {company.description || "No company description available yet."}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Location
                  </p>
                  <p className="mt-2 break-words font-semibold text-white">
                    {company.location || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phone
                  </p>
                  <p className="mt-2 break-words font-semibold text-white">
                    {company.phone || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </p>
                  <p className="mt-2 break-all font-semibold text-white">
                    {company.email || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Website
                  </p>

                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
                    >
                      Visit website ↗
                    </a>
                  ) : (
                    <p className="mt-2 font-medium text-slate-400">
                      Not provided
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs */}
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Career opportunities
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                Available Jobs
              </h2>
              <p className="mt-2 text-slate-400">
                Explore opportunities offered by this company.
              </p>
            </div>

            <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300">
              {jobs.length} {jobs.length === 1 ? "position" : "positions"}
            </span>
          </div>

          {jobs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                💼
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">
                No job vacancies available
              </h3>
              <p className="mt-2 text-slate-400">
                Check back later for new opportunities from this company.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg shadow-black/10 transition duration-200 hover:border-blue-500/60 hover:bg-slate-900/80 sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-white sm:text-2xl">
                      {job.title}
                    </h3>

                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <span aria-hidden="true">📍</span>
                      {job.location || "Location not specified"}
                    </p>

                    <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-300">
                      {job.description || "No job description provided."}
                    </p>
                  </div>

                  <button
                    onClick={() => router.push(`/apply/${job.id}`)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98]"
                  >
                    Apply now
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
