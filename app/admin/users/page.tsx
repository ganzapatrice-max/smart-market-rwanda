"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../../lib/firebase";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState("technicians");
  const [search, setSearch] = useState("");

  //////////////////////////////////////////////////////
  // LOAD USERS LIVE
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "workers"),
      (snap) => {
        const data = snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setUsers(data);
      }
    );

    return () => unsub();
  }, []);

  //////////////////////////////////////////////////////
  // FILTER USERS
  //////////////////////////////////////////////////////
  const technicians = useMemo(() => {
    return users.filter(
      (u) =>
        u.role?.toLowerCase().trim() ===
        "technician"
    );
  }, [users]);

  const patients = useMemo(() => {
    return users.filter(
      (u) =>
        u.role?.toLowerCase().trim() !==
        "technician"
    );
  }, [users]);

  //////////////////////////////////////////////////////
  // SEARCH
  //////////////////////////////////////////////////////
  const filteredTechs = technicians.filter((u) =>
    `${u.name || ""} ${u.phone || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredPatients = patients.filter((u) =>
    `${u.name || ""} ${u.phone || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  //////////////////////////////////////////////////////
  // ACTIONS
  //////////////////////////////////////////////////////
  const toggleBlock = async (
    id: string,
    current: boolean
  ) => {
    await updateDoc(doc(db, "workers", id), {
      blocked: !current,
    });
  };

  const toggleVerify = async (
    id: string,
    current: boolean
  ) => {
    await updateDoc(doc(db, "workers", id), {
      verified: !current,
    });
  };

  const toggleGold = async (
    id: string,
    current: boolean
  ) => {
    await updateDoc(doc(db, "workers", id), {
      subscriptionActive: !current,
    });
  };

  const removeUser = async (id: string) => {
    const ok = confirm(
      "Delete this user permanently?"
    );

    if (!ok) return;

    await deleteDoc(doc(db, "workers", id));
  };

  //////////////////////////////////////////////////////
  // CARD UI
  //////////////////////////////////////////////////////
  const UserCard = ({
    user,
    technician,
  }: {
    user: any;
    technician: boolean;
  }) => (
    <div className="bg-[#111827] p-5 rounded-3xl shadow-xl border border-gray-700">
      {/* TOP BADGES */}
      <div className="flex gap-2 flex-wrap mb-3">
        {technician && user.verified && (
          <span className="bg-blue-600 px-2 py-1 rounded text-xs">
            ✔ VERIFIED
          </span>
        )}

        {technician &&
          user.subscriptionActive && (
            <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
              👑 GOLD
            </span>
          )}

        {user.online ? (
          <span className="bg-green-600 px-2 py-1 rounded text-xs">
            ONLINE
          </span>
        ) : (
          <span className="bg-gray-600 px-2 py-1 rounded text-xs">
            OFFLINE
          </span>
        )}

        {user.blocked && (
          <span className="bg-red-600 px-2 py-1 rounded text-xs">
            BLOCKED
          </span>
        )}
      </div>

      {/* INFO */}
      <p className="font-bold text-lg">
        {user.name || "No Name"}
      </p>

      <p className="text-gray-300">
        📞 {user.phone || "No Phone"}
      </p>

      <p className="text-gray-300">
        📍 {user.location || "No Location"}
      </p>

      {technician && (
        <p className="text-gray-300">
          🛠 {user.service || "No Service"}
        </p>
      )}

      <p className="text-gray-300 mt-2">
        💬 Chats: {user.chatCount || 0}
      </p>

      <p className="text-gray-300">
        🏠 Bookings: {user.bookingCount || 0}
      </p>

      {technician && (
        <p className="text-gray-300">
          💰 Wallet: {user.balance || 0} Frw
        </p>
      )}

      {/* ACTIONS */}
      <div className="flex gap-2 flex-wrap mt-4">
        {technician && (
          <>
            <button
              onClick={() =>
                toggleVerify(
                  user.id,
                  user.verified
                )
              }
              className="bg-blue-600 px-3 py-2 rounded-xl"
            >
              {user.verified
                ? "❌ Unverify"
                : "✔ Verify"}
            </button>

            <button
              onClick={() =>
                toggleGold(
                  user.id,
                  user.subscriptionActive
                )
              }
              className="bg-yellow-400 text-black px-3 py-2 rounded-xl"
            >
              {user.subscriptionActive
                ? "❌ Remove Gold"
                : "👑 Gold"}
            </button>
          </>
        )}

        <button
          onClick={() =>
            toggleBlock(
              user.id,
              user.blocked
            )
          }
          className="bg-red-600 px-3 py-2 rounded-xl"
        >
          {user.blocked
            ? "✅ Unblock"
            : "🚫 Block"}
        </button>

        <button
          onClick={() =>
            removeUser(user.id)
          }
          className="bg-gray-700 px-3 py-2 rounded-xl"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          👤 Users Panel
        </h1>

        <Link
          href="/admin"
          className="bg-gray-700 px-4 py-2 rounded-xl"
        >
          Back
        </Link>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search user name or phone..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full p-4 rounded-2xl bg-[#1f2937] mb-6 outline-none"
      />

      {/* TABS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() =>
            setTab("technicians")
          }
          className={`p-4 rounded-2xl font-bold ${
            tab === "technicians"
              ? "bg-yellow-500 text-black"
              : "bg-[#1f2937]"
          }`}
        >
          👷 Technicians (
          {technicians.length})
        </button>

        <button
          onClick={() =>
            setTab("patients")
          }
          className={`p-4 rounded-2xl font-bold ${
            tab === "patients"
              ? "bg-green-600"
              : "bg-[#1f2937]"
          }`}
        >
          🏥 Patients (
          {patients.length})
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-5">
        {tab === "technicians" &&
          filteredTechs.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              technician={true}
            />
          ))}

        {tab === "patients" &&
          filteredPatients.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              technician={false}
            />
          ))}
      </div>

      {/* EMPTY */}
      {tab === "technicians" &&
        filteredTechs.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            No technicians found
          </p>
        )}

      {tab === "patients" &&
        filteredPatients.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            No patients found
          </p>
        )}
    </main>
  );
}