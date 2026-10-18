
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

function CreateJobForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyId = searchParams.get("companyId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!companyId) {
      setError(
        "Company ID is missing. Open this page from your company dashboard."
      );
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError(
        "Please complete the job title, description, and location."
      );
      return;
    }

    setSaving(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        router.replace("/login");
        return;
      }

      const companySnapshot = await getDoc(
        doc(db, "companies", companyId)
      );

      if (!companySnapshot.exists()) {
        setError("The selected company could not be found.");
        return;
      }

      const company = companySnapshot.data();

      // Only the registered owner may publish jobs for this company.
      if (
        !company.ownerUid ||
        company.ownerUid !== user.uid
      ) {
        setError(
          "Access denied. Only the company owner can publish jobs for this company."
        );
        return;
      }

      await addDoc(collection(db, "jobs"), {
        companyId,
        companyName: company.name || "",
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        location: location.trim(),
        employmentType,
        salary: salary.trim(),
        deadline: deadline || "",
        status: "published",
        createdAt: serverTimestamp(),
      });

      router.push(`/company/${companyId}`);
    } catch (err) {
      console.error("Failed to create job:", err);
      setError(
        "Unable to publish this vacancy. Check your connection and Firestore security rules, then try again."
      );
    } finally {
      setSaving(false);
    }
  }


  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href={
            companyId
              ? `/company/dashboard?companyId=${encodeURIComponent(companyId)}`
              : "/company/register"
          }
          className="text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          ← Back to Company Dashboard
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl sm:p-8">
          <h1 className="text-3xl font-extrabold">Post a Job</h1>
          <p className="mt-2 text-slate-400">
            Publish a vacancy so job seekers can discover your opportunity.
          </p>

          {!companyId && (
            <div className="mt-6 rounded-xl bg-amber-950 p-4 text-amber-200">
              Company ID is missing. Open the job form from your company
              dashboard to select your registered company.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-200"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="title" className="font-semibold">
                Job title *
              </label>
              <input
                id="title"
                className={inputClass}
                placeholder="e.g. Construction Site Supervisor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="font-semibold">
                Job description *
              </label>
              <textarea
                id="description"
                className={inputClass}
                placeholder="Describe responsibilities, qualifications, and requirements..."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="font-semibold">
                Job category
              </label>
              <input
                id="category"
                className={inputClass}
                placeholder="e.g. Construction, IT, Accounting"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="location" className="font-semibold">
                Job location *
              </label>
              <input
                id="location"
                className={inputClass}
                placeholder="e.g. Kigali, Rwanda"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="employmentType" className="font-semibold">
                Employment type
              </label>
              <select
                id="employmentType"
                className={inputClass}
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Temporary</option>
                <option>Internship</option>
              </select>
            </div>

            <div>
              <label htmlFor="salary" className="font-semibold">
                Salary (optional)
              </label>
              <input
                id="salary"
                className={inputClass}
                placeholder="e.g. 300,000 RWF per month"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="deadline" className="font-semibold">
                Application deadline (optional)
              </label>
              <input
                id="deadline"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className={inputClass}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={saving || !companyId}
              className="w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Publishing..." : "Publish Job Vacancy"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 p-6 text-white">
          Loading job form...
        </main>
      }
    >
      <CreateJobForm />
    </Suspense>
  );
}
