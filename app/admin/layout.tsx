"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        // NOT LOGGED IN
        if (!user) {
          setLoading(false);
          router.push("/login");
          return;
        }

        // GET USER DATA
        const snap = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!snap.exists()) {
          setLoading(false);
          router.push("/");
          return;
        }

        const data = snap.data();

        // NOT ADMIN
        if (data.role !== "admin") {
          setLoading(false);
          router.push("/");
          return;
        }

        // ADMIN OK
        setAllowed(true);
        setLoading(false);

      } catch (error) {
        setLoading(false);
        router.push("/");
      }
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-2xl font-bold">
        Checking Access...
      </main>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  return null;
}