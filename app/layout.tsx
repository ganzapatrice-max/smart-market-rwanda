import "./globals.css";
import Navbar from "./Navbar";
import Link from "next/link";

export const metadata = {
  title: "Smart Market Rwanda",
  description: "One place for everything",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f0f2f5] text-gray-900">

        {/* ✅ NAVBAR (CLIENT COMPONENT) */}
        <Navbar />

        {/* ✅ MAIN LAYOUT */}
        <div className="max-w-6xl mx-auto flex gap-6 px-4 py-6">

          {/* ===== LEFT SIDEBAR ===== */}
          <aside className="hidden md:block w-1/4">
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold mb-2">Menu</p>

              <div className="flex flex-col gap-2 text-sm">
                <Link href="/jobs">💼 Jobs</Link>
                <Link href="/market">🛒 Market</Link>
                <Link href="/messages">💬 Messages</Link>
                <Link href="/settings">⚙️ Settings</Link>
              </div>
            </div>
          </aside>

          {/* ===== CENTER CONTENT ===== */}
          <main className="flex-1 max-w-2xl w-full">
            {children}
          </main>

          {/* ===== RIGHT PANEL ===== */}
          <aside className="hidden lg:block w-1/4">
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold mb-2">Suggestions</p>
              <p className="text-sm text-gray-600">
                Discover users, services, and opportunities.
              </p>
            </div>
          </aside>

        </div>
      </body>
    </html>
  );
}