"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function WithdrawPage() {
  const router = useRouter();

  const [uid, setUid] = useState("");
  const [name, setName] = useState("");

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("MTN");

  // MTN / Airtel
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNo, setIdNo] = useState("");

  // Bank
  const [ownerName, setOwnerName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////////
  // CHECK LOGIN + LOAD REAL NAME
  //////////////////////////////////////////////////////
  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.push("/login");
          return;
        }

        setUid(user.uid);

        const snap = await getDoc(
          doc(db, "users", user.uid)
        );

        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "User");
        } else {
          setName("User");
        }
      }
    );

    return () => unsub();
  }, [router]);

  //////////////////////////////////////////////////////
  // SUBMIT
  //////////////////////////////////////////////////////
  const submitWithdraw = async () => {
    try {
      if (!amount) {
        alert("Enter amount");
        return;
      }

      if (method === "MTN" || method === "Airtel") {
        if (!fullName || !phone || !idNo) {
          alert("Fill all fields");
          return;
        }
      }

      if (method === "Bank") {
        if (
          !ownerName ||
          !bankName ||
          !accountNumber ||
          !phone ||
          !idNo
        ) {
          alert("Fill all bank fields");
          return;
        }
      }

      setLoading(true);

      await addDoc(collection(db, "withdrawals"), {
        uid,
        name,
        amount: Number(amount),
        method,

        // momo
        fullName,
        phone,
        idNo,

        // bank
        ownerName,
        bankName,
        accountNumber,

        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert("Withdrawal request sent!");

      setAmount("");
      setMethod("MTN");
      setFullName("");
      setPhone("");
      setIdNo("");
      setOwnerName("");
      setBankName("");
      setAccountNumber("");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#111827] to-[#0f172a] text-white flex justify-center items-center p-5">

      <div className="w-full max-w-md bg-[#111827] border border-gray-700 rounded-3xl p-6 shadow-2xl">

        <h1 className="text-3xl font-bold text-center">
          💸 Withdraw Money
        </h1>

        <p className="text-center text-gray-400 mt-2 mb-6">
          Request payout safely
        </p>

        <input
          type="number"
          placeholder="Amount (FRW)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-4 rounded-2xl text-black mb-4"
        />

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-4 rounded-2xl text-black mb-4"
        >
          <option>MTN</option>
          <option>Airtel</option>
          <option>Bank</option>
        </select>

        {(method === "MTN" || method === "Airtel") && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-4 rounded-2xl text-black mb-4"
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 rounded-2xl text-black mb-4"
            />

            <input
              type="text"
              placeholder="ID Number"
              value={idNo}
              onChange={(e) => setIdNo(e.target.value)}
              className="w-full p-4 rounded-2xl text-black mb-4"
            />
          </>
        )}

        {method === "Bank" && (
          <>
            <input
              type="text"
              placeholder="Name of Owner"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full p-4 rounded-2xl text-black mb-4"
            />

            <input
              type="text"
              placeholder="Name of Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full p-4 rounded-2xl text-black mb-4"
            />

            <input
              type="text"
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full p-4 rounded-2xl text-black mb-4"
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 rounded-2xl text-black mb-4"
            />

            <input
              type="text"
              placeholder="ID Number"
              value={idNo}
              onChange={(e) => setIdNo(e.target.value)}
              className="w-full p-4 rounded-2xl text-black mb-4"
            />
          </>
        )}

        <button
          onClick={submitWithdraw}
          disabled={loading}
          className="w-full bg-green-600 p-4 rounded-2xl font-bold"
        >
          {loading ? "Sending..." : "SEND REQUEST"}
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full mt-4 bg-blue-600 p-4 rounded-2xl font-bold"
        >
          ⬅ Back Home
        </button>

      </div>
    </main>
  );
}