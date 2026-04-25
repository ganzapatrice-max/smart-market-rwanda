import "./globals.css";
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

        {/* ================= NAVBAR ================= */}
        <header className="bg-blue-600 text-white shadow-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">

            {/* LEFT LOGO */}
            <h1 className="text-lg font-semibold">
              Smart Market Rwanda
            </h1>

            {/* CENTER NAV */}
            <nav className="flex gap-6 text-xl">
              <Link href="/">🏠</Link>
              <Link href="/profile">👤</Link>
              <Link href="/services">🛠</Link>
              <Link href="/notifications">🔔</Link>
            </nav>

            {/* RIGHT */}
            <div className="text-xs bg-blue-500 px-3 py-1 rounded-full">
              🇷🇼 Trusted
            </div>

          </div>
        </header>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="max-w-6xl mx-auto flex gap-6 px-4 py-6">

          {/* ===== LEFT SIDEBAR ===== */}
          <aside className="hidden md:block w-1/4">

            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <p className="font-semibold mb-2">Menu</p>

              <div className="flex flex-col gap-2 text-sm">
                <Link href="/">🏠 Feed</Link>
                <Link href="/profile">👤 Profile</Link>
                <Link href="/services">🛠 Services</Link>
                <Link href="/jobs">💼 Jobs</Link>
                <Link href="/market">🛒 Market</Link>
              </div>
            </div>

          </aside>

          {/* ===== CENTER FEED ===== */}
          <main className="flex-1 max-w-2xl w-full">
            {children}
          </main>

          {/* ===== RIGHT PANEL ===== */}
          <aside className="hidden lg:block w-1/4">

            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <p className="font-semibold mb-2">Suggestions</p>

              <div className="text-sm text-gray-600">
                Follow users, explore services, and discover opportunities.
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold mb-2">Trending</p>

              <div className="text-sm text-gray-600">
                #SmartMarket <br />
                #RwandaBusiness <br />
                #Jobs <br />
                #Services
              </div>
            </div>

          </aside>

        </div>

      </body>
    </html>
  );
}