import "./globals.css";

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
      <body className="bg-gray-100 text-gray-900 min-h-screen">

        {/* MAIN WRAPPER */}
        <div className="min-h-screen flex flex-col">

          {/* TOP HEADER */}
          <header className="bg-blue-700 text-white shadow-lg">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

              <div>
                <h1 className="text-2xl font-bold">
                  Smart Market Rwanda
                </h1>

                <p className="text-sm text-blue-100">
                  One place for everything
                </p>
              </div>

              <div className="text-sm bg-blue text-red-600 px-4 py-2 rounded-xl font-semibold">
                Trusted Platform 🇷🇼
              </div>

            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="bg-black text-gray-300 text-center py-4 text-sm">
            © 2026 Smart Market Rwanda Patrice— All Rights Reserved
          </footer>

        </div>

      </body>
    </html>
  );
}