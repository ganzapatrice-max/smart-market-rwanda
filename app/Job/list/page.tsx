
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Company = {
  id: string;
  name?: string;
  industry?: string;
  description?: string;
  logo?: string;
  cover?: string;
  province?: string;
  district?: string;
  sector?: string;
  verified?: boolean;
};

const categoryAliases: Record<string, string[]> = {
  "Construction Companies": ["construction", "contractor", "building"],
  "Factories & Manufacturing": ["factory", "factories", "manufacturing", "industrial"],
  "Hotels & Restaurants": ["hotel", "hospitality", "restaurant", "catering"],
  "Hospitals & Clinics": ["hospital", "clinic", "healthcare", "medical"],
  "Schools & Universities": ["school", "university", "education", "college"],
  "Shops & Supermarkets": ["shop", "supermarket", "retail", "store"],
  "Transport & Logistics": ["transport", "logistics", "delivery", "freight"],
  "Agriculture Companies": ["agriculture", "farming", "agribusiness"],
  "IT & Software Companies": ["it", "software", "technology", "tech"],
  "Banks & Financial Services": ["bank", "finance", "financial", "insurance"],
  "Media & Advertising": ["media", "advertising", "marketing"],
  "Real Estate Companies": ["real estate", "property", "housing"],
  "Travel & Tourism": ["travel", "tourism", "tour", "tourism"],
  "Retail Businesses": ["retail", "shop", "supermarket", "store"],
  "Law Firms": ["law", "legal", "law firm"],
  "Accounting Firms": ["accounting", "accountancy", "audit"],
  "Government Institutions": ["government", "public institution", "public sector"],
  "NGOs & Non-Profit": ["ngo", "non-profit", "nonprofit", "charity"],
  "Recruitment Agencies": ["recruitment", "staffing", "employment agency"],
  "Private Companies": ["private company", "private"],
  "Telecommunication Companies": ["telecommunication", "telecom", "telecommunications"],
  "Solar Companies": ["solar"],
  "Water Companies": ["water"],
  "Energy Companies": ["energy", "electricity", "power"],
  "Security Companies": ["security", "guarding"],
  "Beauty Salons & Spas": ["beauty", "salon", "spa", "cosmetics"],
  "Event Management Companies": ["event management", "events"],
  "Film & Production Companies": ["film", "production", "video production"],
  "Car Dealers & Garages": ["car dealer", "garage", "automotive", "vehicle repair"],
  "Delivery Companies": ["delivery", "courier", "logistics"],
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchesCategory(company: Company, category: string) {
  const industry = normalize(company.industry || "");
  const selectedCategory = normalize(category);

  if (!industry) return false;
  if (industry === selectedCategory) return true;

  const aliases = categoryAliases[category] || [category];

  return aliases.some((alias) => {
    const normalizedAlias = normalize(alias);
    return industry.includes(normalizedAlias);
  });
}

function JobsListContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompanies() {
      setLoading(true);
      setError("");

      try {
        const snapshot = await getDocs(collection(db, "companies"));

        const allCompanies = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as Company[];

        if (active) {
          setCompanies(allCompanies);
        }
      } catch (err) {
        console.error("Failed to load companies:", err);

        if (active) {
          setError(
            "Could not load companies. Please check your connection and try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCompanies();

    return () => {
      active = false;
    };
  }, []);

  const filteredCompanies = companies.filter((company) =>
    matchesCategory(company, category)
  );

  return (
    <main className="min-h-screen bg-slate-100 pb-12">
      <header className="bg-slate-900 px-5 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/job"
            className="text-sm text-blue-300 hover:text-blue-200"
          >
            ← Back to Find a Job
          </Link>

          <h1 className="mt-4 text-3xl font-bold md:text-4xl">
            {category || "Browse Companies"}
          </h1>

          <p className="mt-2 text-slate-300">
            Discover registered companies and explore their job opportunities.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        {loading && (
          <p className="rounded-xl bg-white p-6 text-slate-600 shadow">
            Loading registered companies...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-white p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && !category && (
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-slate-800">
              Choose a company category
            </h2>
            <p className="mt-2 text-slate-600">
              Return to Find a Job and select the type of company you want to
              explore.
            </p>
          </div>
        )}

        {!loading && !error && category && filteredCompanies.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="text-5xl">🏢</div>

            <h2 className="mt-4 text-2xl font-bold text-slate-800">
              No companies found
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-slate-600">
              There are currently no registered companies matching{" "}
              <strong>{category}</strong>. Companies will appear here when
              their registered industry matches this category.
            </p>

            <Link
              href="/company/register"
              className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Register a Company
            </Link>
          </div>
        )}

        {!loading && !error && filteredCompanies.length > 0 && (
          <>
            <p className="mb-5 text-slate-600">
              {filteredCompanies.length}{" "}
              {filteredCompanies.length === 1 ? "company" : "companies"} found
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map((company) => (
                <article
                  key={company.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {company.cover ? (
                    <img
                      src={company.cover}
                      alt=""
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-gradient-to-r from-slate-800 to-blue-800 text-5xl">
                      🏢
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={`${company.name || "Company"} logo`}
                          className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                          🏢
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h2 className="break-words text-xl font-bold text-slate-900">
                          {company.name || "Unnamed Company"}
                        </h2>

                        <p className="mt-1 text-sm text-blue-700">
                          {company.industry || category}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm text-slate-600">
                      {company.description || "Learn more about this company and its opportunities."}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      📍{" "}
                      {[company.sector, company.district, company.province]
                        .filter(Boolean)
                        .join(", ") || "Location not provided"}
                    </p>

                    {company.verified && (
                      <p className="mt-3 text-sm font-semibold text-green-700">
                        ✓ Verified company
                      </p>
                    )}

                    <Link
                      href={`/company/${company.id}`}
                      className="mt-5 block rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Company & Jobs →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function JobsListPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-100 p-8">
          <p className="text-slate-600">Loading companies...</p>
        </main>
      }
    >
      <JobsListContent />
    </Suspense>
  );
}
