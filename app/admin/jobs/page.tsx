"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);

  //////////////////////////////////////////////////////
  // LOAD JOBS
  //////////////////////////////////////////////////////
  useEffect(() => {
  const q = collection(db, "jobs");

  const unsub = onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setJobs(data);
    },
    (error) => {
      console.log(error);
      alert(error.message);
    }
  );

  return () => unsub();
}, []);

  //////////////////////////////////////////////////////
  // COMPLETE JOB
  //////////////////////////////////////////////////////
  const completeJob = async (id: string) => {
    await updateDoc(doc(db, "jobs", id), {
      status: "completed",
    });

    alert("Job completed");
  };

  //////////////////////////////////////////////////////
  // ACCEPT JOB
  //////////////////////////////////////////////////////
  const acceptJob = async (id: string) => {
    await updateDoc(doc(db, "jobs", id), {
      status: "working",
    });

    alert("Job accepted");
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white p-5">

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          🛠 Jobs Page
        </h1>

        <p className="text-gray-400 mt-1">
          Manage bookings & services
        </p>
      </div>

      <Link
        href="/"
        className="block text-center bg-blue-600 p-4 rounded-2xl font-bold mb-6"
      >
        ⬅ Back Home
      </Link>

      <div className="space-y-5">

        {jobs.length === 0 && (
          <div className="bg-[#111827] p-5 rounded-2xl">
            No jobs found
          </div>
        )}

        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-[#111827] border border-gray-700 rounded-3xl p-5 shadow-xl"
          >
            <p className="text-xl font-bold">
              🔧 {job.service || "Service"}
            </p>

            <p className="mt-2">
              👤 Customer: {job.customerName || "User"}
            </p>

            <p className="mt-2">
              💰 Price:
              <span className="text-yellow-400 font-bold ml-2">
                {job.price || 0} FRW
              </span>
            </p>

            <p className="mt-2">
              📌 Status:
              <span className="ml-2 capitalize font-bold">
                {job.status || "pending"}
              </span>
            </p>

            <div className="space-y-3 mt-5">

              {job.status === "pending" && (
                <button
                  onClick={() => acceptJob(job.id)}
                  className="w-full bg-blue-600 p-4 rounded-2xl font-bold"
                >
                  ✅ Accept Job
                </button>
              )}

              {job.status === "working" && (
                <button
                  onClick={() => completeJob(job.id)}
                  className="w-full bg-green-600 p-4 rounded-2xl font-bold"
                >
                  💸 Complete Job
                </button>
              )}

              {job.status === "completed" && (
                <div className="w-full bg-gray-700 p-4 rounded-2xl text-center font-bold">
                  ✔ Completed
                </div>
              )}

            </div>
          </div>
        ))}

      </div>
    </main>
  );
}