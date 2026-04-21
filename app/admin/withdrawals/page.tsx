"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    withdrawn: 0,
  });

  //////////////////////////////////////////////////////
  // LOAD WITHDRAWALS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "withdrawals"),
      (snap) => {
        const data = snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setRequests(data);
      }
    );

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD PLATFORM STATS
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadStats = async () => {
      const snap = await getDoc(
        doc(db, "platform", "main")
      );

      if (snap.exists()) {
        const data = snap.data();

        setStats({
          totalRevenue:
            data.totalRevenue || 0,
          withdrawn:
            data.withdrawn || 0,
        });
      }
    };

    loadStats();
  }, []);

  //////////////////////////////////////////////////////
  // APPROVE REQUEST
  //////////////////////////////////////////////////////
  const approveRequest = async (
    id: string,
    amount: number,
    status: string
  ) => {
    if (status === "approved") {
      alert("Already approved");
      return;
    }

    const platformRef = doc(
      db,
      "platform",
      "main"
    );

    const snap =
      await getDoc(platformRef);

    let totalRevenue = 0;
    let withdrawn = 0;

    if (snap.exists()) {
      const data = snap.data();

      totalRevenue =
        data.totalRevenue || 0;

      withdrawn =
        data.withdrawn || 0;
    }

    if (totalRevenue < amount) {
      alert(
        "Not enough balance"
      );
      return;
    }

    await updateDoc(
      doc(db, "withdrawals", id),
      {
        status: "approved",
      }
    );

    await setDoc(
      platformRef,
      {
        totalRevenue:
          totalRevenue - amount,

        withdrawn:
          withdrawn + amount,
      },
      { merge: true }
    );

    setStats({
      totalRevenue:
        totalRevenue - amount,

      withdrawn:
        withdrawn + amount,
    });
  };

  //////////////////////////////////////////////////////
  // REJECT
  //////////////////////////////////////////////////////
  const rejectRequest = async (
    id: string
  ) => {
    await updateDoc(
      doc(db, "withdrawals", id),
      {
        status: "rejected",
      }
    );
  };

  //////////////////////////////////////////////////////
  // COUNTS
  //////////////////////////////////////////////////////
  const pending = requests.filter(
    (r) => r.status === "pending"
  ).length;

  const approved = requests.filter(
    (r) => r.status === "approved"
  ).length;

  const pendingBalance = requests
    .filter(
      (r) => r.status === "pending"
    )
    .reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    );

  //////////////////////////////////////////////////////
  // SEARCH
  //////////////////////////////////////////////////////
  const filteredRequests =
    requests.filter((item) =>
      `${item.name || ""} ${
        item.phone || ""
      } ${item.status || ""} ${
        item.amount || ""
      } ${item.method || ""}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  //////////////////////////////////////////////////////
  // CARD
  //////////////////////////////////////////////////////
  const Card = ({
    title,
    value,
    color,
  }: any) => (
    <div
      className={`${color} rounded-3xl p-5 shadow-xl`}
    >
      <p className="text-sm opacity-90">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>
    </div>
  );

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white p-5">

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          💸 Withdrawals Panel
        </h1>

        <p className="text-gray-400 mt-1">
          Finance Center
        </p>
      </div>

      <div className="space-y-4 mb-6">

        <Card
          title="Platform Balance"
          value={`${stats.totalRevenue} Frw`}
          color="bg-cyan-600"
        />

        <Card
          title="Withdrawn Money"
          value={`${stats.withdrawn} Frw`}
          color="bg-orange-500"
        />

        <Card
          title="Pending Requests"
          value={pending}
          color="bg-red-600"
        />

        <Card
          title="Approved Requests"
          value={approved}
          color="bg-green-600"
        />

        <Card
          title="Pending Balance"
          value={`${pendingBalance} Frw`}
          color="bg-purple-600"
        />

        <Link
          href="/admin"
          className="w-full block text-center bg-gray-700 p-4 rounded-3xl font-bold"
        >
          🔙 Back Dashboard
        </Link>

      </div>

      <input
        type="text"
        placeholder="Search withdrawals..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full p-4 rounded-3xl bg-[#1f2937] outline-none mb-6"
      />

      <div className="space-y-5">

        {filteredRequests.map(
          (item) => (
            <div
              key={item.id}
              className="bg-[#111827] border border-gray-700 rounded-3xl p-5 shadow-xl"
            >
              <p className="text-xl font-bold">
                👷 {item.name || "User"}
              </p>

              <p className="mt-1">
                💳 Method:
                {" "}
                {item.method || "-"}
              </p>

              <p className="mt-1">
                💰 Amount:
                <span className="text-yellow-400 font-bold ml-2">
                  {item.amount || 0} Frw
                </span>
              </p>

              <p className="mt-1">
                👤 Full Name:
                {" "}
                {item.fullName || "-"}
              </p>

              <p className="mt-1">
                👤 Registered Name:
                {" "}
                {item.name || "-"}
              </p>

              {item.method ===
                "Bank" && (
                <>
                  <p className="mt-1">
                    👤 Owner Name:
                    {" "}
                    {item.ownerName ||
                      "-"}
                  </p>

                  <p className="mt-1">
                    🏦 Bank Name:
                    {" "}
                    {item.bankName ||
                      "-"}
                  </p>

                  <p className="mt-1">
                    💳 Account Number:
                    {" "}
                    {item.accountNumber ||
                      "-"}
                  </p>
                </>
              )}

              <p className="mt-1">
                📞 Phone:
                {" "}
                {item.phone || "-"}
              </p>

              <p className="mt-1">
                🆔 ID No:
                {" "}
                {item.idNo || "-"}
              </p>

              <p className="mt-1">
                📌 Status:
                <span className="ml-2 font-bold capitalize">
                  {item.status ||
                    "pending"}
                </span>
              </p>

              <div className="space-y-3 mt-5">

                <button
                  onClick={() =>
                    approveRequest(
                      item.id,
                      Number(
                        item.amount
                      ),
                      item.status
                    )
                  }
                  className="w-full bg-green-600 p-4 rounded-2xl font-bold"
                >
                  ✅ APPROVE
                </button>

                <button
                  onClick={() =>
                    rejectRequest(
                      item.id
                    )
                  }
                  className="w-full bg-red-600 p-4 rounded-2xl font-bold"
                >
                  ❌ REJECT
                </button>

              </div>
            </div>
          )
        )}

      </div>

    </main>
  );
}