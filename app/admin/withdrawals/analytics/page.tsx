"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";

import {
  doc,
  getDoc,
} from "firebase/firestore";

export default function RevenueAnalyticsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    adsRevenue: 0,
    bookingsRevenue: 0,
    chatsRevenue: 0,
    withdrawn: 0,
  });

  //////////////////////////////////////////////////////
  // LOAD DATA
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

          todayRevenue:
            data.todayRevenue || 0,

          weekRevenue:
            data.weekRevenue || 0,

          monthRevenue:
            data.monthRevenue || 0,

          adsRevenue:
            data.adsRevenue || 0,

          bookingsRevenue:
            data.bookingsRevenue || 0,

          chatsRevenue:
            data.chatsRevenue || 0,

          withdrawn:
            data.withdrawn || 0,
        });
      }
    };

    loadStats();
  }, []);

  //////////////////////////////////////////////////////
  // CALCULATE
  //////////////////////////////////////////////////////
  const balance =
    stats.totalRevenue -
    stats.withdrawn;

  const percent = (
    amount: number
  ) => {
    if (
      stats.totalRevenue === 0
    )
      return 0;

    return Math.min(
      100,
      Math.round(
        (amount /
          stats.totalRevenue) *
          100
      )
    );
  };

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
        {value} Frw
      </h2>
    </div>
  );

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white p-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            📈 Revenue Analytics
          </h1>

          <p className="text-gray-400 mt-1">
            Business performance dashboard
          </p>
        </div>

        <Link
          href="/admin"
          className="bg-gray-700 px-4 py-2 rounded-xl"
        >
          Back
        </Link>
      </div>

      {/* TOP CARDS */}
      <div className="grid gap-4 mb-6">
        <Card
          title="Today Revenue"
          value={
            stats.todayRevenue
          }
          color="bg-green-600"
        />

        <Card
          title="This Week"
          value={
            stats.weekRevenue
          }
          color="bg-blue-600"
        />

        <Card
          title="This Month"
          value={
            stats.monthRevenue
          }
          color="bg-purple-600"
        />

        <Card
          title="Total Revenue"
          value={
            stats.totalRevenue
          }
          color="bg-yellow-500 text-black"
        />
      </div>

      {/* MONEY STATUS */}
      <div className="bg-[#111827] border border-gray-700 rounded-3xl p-5 mb-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          💰 Money Status
        </h2>

        <div className="space-y-3">
          <p>
            Withdrawn:{" "}
            <span className="text-red-400 font-bold">
              {stats.withdrawn} Frw
            </span>
          </p>

          <p>
            Remaining Balance:{" "}
            <span className="text-green-400 font-bold">
              {balance} Frw
            </span>
          </p>
        </div>
      </div>

      {/* SOURCES */}
      <div className="bg-[#111827] border border-gray-700 rounded-3xl p-5 shadow-xl">

        <h2 className="text-xl font-bold mb-5">
          📊 Revenue Sources
        </h2>

        {/* ADS */}
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span>
              📢 Ads Revenue
            </span>

            <span>
              {stats.adsRevenue} Frw
            </span>
          </div>

          <div className="w-full bg-gray-700 h-3 rounded-full">
            <div
              className="bg-yellow-400 h-3 rounded-full"
              style={{
                width: `${percent(
                  stats.adsRevenue
                )}%`,
              }}
            />
          </div>
        </div>

        {/* BOOKINGS */}
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span>
              🏠 Bookings Revenue
            </span>

            <span>
              {
                stats.bookingsRevenue
              }{" "}
              Frw
            </span>
          </div>

          <div className="w-full bg-gray-700 h-3 rounded-full">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{
                width: `${percent(
                  stats.bookingsRevenue
                )}%`,
              }}
            />
          </div>
        </div>

        {/* CHATS */}
        <div>
          <div className="flex justify-between mb-2">
            <span>
              💬 Chats Revenue
            </span>

            <span>
              {stats.chatsRevenue} Frw
            </span>
          </div>

          <div className="w-full bg-gray-700 h-3 rounded-full">
            <div
              className="bg-cyan-500 h-3 rounded-full"
              style={{
                width: `${percent(
                  stats.chatsRevenue
                )}%`,
              }}
            />
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="text-center text-gray-500 mt-8">
        QuickFix Rwanda Premium Analytics
      </div>

    </main>
  );
}