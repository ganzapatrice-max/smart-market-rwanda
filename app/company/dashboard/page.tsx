
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type CompanyData = {
  id: string;
  name?: string;
  industry?: string;
  description?: string;
  district?: string;
  sector?: string;
  logo?: string;
};

function CompanyDashboardContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompany() {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(
          doc(db, "companies", companyId)
        );

        if (!active) return;

        if (snapshot.exists()) {
          setCompany({
            id: snapshot.id,
            ...snapshot.data(),
          } as CompanyData);
        } else {
          setError("Company not found.");
        }
      } catch (err) {
        console.error("Failed to load company:", err);
        if (active) {
          setError("Unable to load company information.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCompany();

    return () => {
      active = false;
    };
  }, [companyId]);

  const cards = [
    {
      icon: "🏢",
      title: "Company Profile",
      description: "View your company information.",
      href: company ? `/company/${company.id}` : "/company",
    },
    {
      icon: "📢",
      title: "Post a Job",
      description: "Create a new job opportunity.",
      href: "/company/jobs/create",
    },
    {
      icon: "💼",
      title: "My Jobs",
      description: "Manage all posted jobs.",
      href: "/company/jobs",
    },
    {
      icon: "📄",
      title: "Applications",
      description: "Review job applications.",
      href: "/company/applications",
    },
    {
      icon: "💬",
      title: "Messages",
      description: "Chat with applicants.",
      href: "/company/messages",
    },
    {
      icon: "🏠",
      title: "Home",
      description: "Return to the home page.",
      href: "/",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="bg-blue-700 shadow">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-3xl font-bold md:text-4xl">
            Company Dashboard
          </h1>
          <p className="mt-2 text-blue-100">
            Manage your company, jobs and applications.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 p-6">
        {loading && (
          <p className="text-slate-300">
            Loading company information...
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-red-950 p-4 text-red-200">
            {error}
          </p>
        )}

        {!loading && company && (
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name || "Company"} logo`}
                  className="h-24 w-24 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-800 text-4xl">
                  🏢
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {company.name || "Your Company"}
                </h2>
                <p className="mt-1 text-blue-300">
                  {company.industry || "Industry not specified"}
                </p>
                <p className="mt-2 text-slate-300">
                  {company.description || "No company description added yet."}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {[company.sector, company.district]
                    .filter(Boolean)
                    .join(", ") || "Location not specified"}
                </p>
              </div>

              <Link
                href={`/company/${company.id}`}
                className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold hover:bg-blue-500"
              >
                View Company Profile
              </Link>
            </div>
          </section>
        )}

        {!loading && !company && !error && (
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              No company selected
            </h2>
            <p className="mt-2 text-slate-300">
              Register a company or open this dashboard using your
              company registration link.
            </p>
            <Link
              href="/company/register"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
            >
              Register Company
            </Link>
          </section>
        )}

        <section>
          <h2 className="mb-5 text-2xl font-bold">
            Dashboard Tools
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-6 transition hover:border-blue-500 hover:bg-slate-800"
              >
                <div className="mb-4 text-5xl">{card.icon}</div>
                <h3 className="text-xl font-bold">
                  {card.title}
                </h3>
                <p className="mt-2 text-slate-400">
                  {card.description}
                </p>
              </Link>

            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CompanyDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 p-6 text-white">
          Loading company dashboard...
        </main>
      }
    >
      <CompanyDashboardContent />
    </Suspense>
  );
}