import "./globals.css";
import Navbar from "./Navbar";

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

        <Navbar /> {/* 👈 client component */}

        <div className="max-w-6xl mx-auto flex gap-6 px-4 py-6">
          
          {/* LEFT SIDEBAR */}
          <aside className="hidden md:block w-1/4">
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold mb-2">Menu</p>

              <div className="flex flex-col gap-2 text-sm">
                <a href="/jobs">💼 Jobs</a>
                <a href="/market">🛒 Market</a>
                <a href="/messages">💬 Messages</a>
                <a href="/settings">⚙️ Settings</a>
              </div>
            </div>
          </aside>

          {/* CENTER */}
          <main className="flex-1 max-w-2xl w-full">
            {children}
          </main>

          {/* RIGHT */}
          <aside className="hidden lg:block w-1/4">
            <div className="bg-white p-4 rounded-xl shadow">
              Suggestions
            </div>
          </aside>

        </div>
      </body>
    </html>
  );
}