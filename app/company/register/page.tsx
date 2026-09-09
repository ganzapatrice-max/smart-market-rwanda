```tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

const CLOUD_NAME = "dmebligcw";
const UPLOAD_PRESET = "quickfix";

export default function RegisterCompanyPage() {
  const [company, setCompany] = useState({
    name: "",
    registrationNumber: "",
    industry: "Construction",
    description: "",
    founded: "",
    employees: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    country: "Rwanda",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const updateCompany = (
    field: keyof typeof company,
    value: string
  ) => {
    setCompany((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error("Cloudinary did not return an image URL");
    }

    return data.secure_url;
  };

  const saveCompany = async () => {
    try {
      setLoading(true);

      let logoUrl = "";
      let coverUrl = "";

      // Upload company logo
      if (logo) {
        logoUrl = await uploadImage(logo);
      }

      // Upload company cover
      if (cover) {
        coverUrl = await uploadImage(cover);
      }

      // Upload gallery images
      const galleryUrls: string[] = [];

      for (const photo of gallery) {
        const url = await uploadImage(photo);
        galleryUrls.push(url);
      }

      // Save company information to Firestore
      await addDoc(collection(db, "companies"), {
        ...company,
        logo: logoUrl,
        cover: coverUrl,
        gallery: galleryUrls,
        createdAt: serverTimestamp(),
        verified: false,
        rating: 0,
        jobs: 0,
      });

      alert("Company registered successfully!");

      window.location.href = "/company";
    } catch (error) {
      console.error("Error registering company:", error);

      alert(
        "Something went wrong while registering the company."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-lg">
        {/* Page Header */}
        <h1 className="mb-2 text-center text-4xl font-bold">
          Register Construction Company
        </h1>

        <p className="mb-10 text-center text-gray-500">
          Complete your company profile to start posting jobs.
        </p>

        {/* Company Images */}
        <section>
          <h2 className="mb-5 text-2xl font-bold">
            Company Images
          </h2>

          <div className="mb-10 space-y-6">
            {/* Company Logo */}
            <div>
              <label
                htmlFor="company-logo"
                className="mb-2 block font-semibold"
              >
                Company Logo
              </label>

              <input
                id="company-logo"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setLogo(event.target.files?.[0] ?? null);
                }}
                className="w-full rounded-xl border p-3"
              />
            </div>

            {/* Cover Photo */}
            <div>
              <label
                htmlFor="company-cover"
                className="mb-2 block font-semibold"
              >
                Cover Photo
              </label>

              <input
                id="company-cover"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setCover(event.target.files?.[0] ?? null);
                }}
                className="w-full rounded-xl border p-3"
              />
            </div>

            {/* Gallery Photos */}
            <div>
              <label
                htmlFor="company-gallery"
                className="mb-2 block font-semibold"
              >
                Gallery Photos
              </label>

              <input
                id="company-gallery"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  setGallery(
                    Array.from(event.target.files ?? [])
                  );
                }}
                className="w-full rounded-xl border p-3"
              />
            </div>
          </div>
        </section>

        {/* Company Information */}
        <section>
          <h2 className="mb-5 text-2xl font-bold">
            Company Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <input
              className="rounded-xl border p-4"
              placeholder="Company Name"
              value={company.name}
              onChange={(event) =>
                updateCompany("name", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              placeholder="Registration Number"
              value={company.registrationNumber}
              onChange={(event) =>
                updateCompany(
                  "registrationNumber",
                  event.target.value
                )
              }
            />

            <input
              className="rounded-xl border p-4"
              placeholder="Industry"
              value={company.industry}
              onChange={(event) =>
                updateCompany("industry", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              placeholder="Founded Year"
              value={company.founded}
              onChange={(event) =>
                updateCompany("founded", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              placeholder="Number of Employees"
              value={company.employees}
              onChange={(event) =>
                updateCompany("employees", event.target.value)
              }
            />
          </div>

          <textarea
            className="mt-5 w-full rounded-xl border p-4"
            rows={5}
            placeholder="Company Description"
            value={company.description}
            onChange={(event) =>
              updateCompany(
                "description",
                event.target.value
              )
            }
          />
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="mb-5 mt-10 text-2xl font-bold">
            Contact Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <input
              className="rounded-xl border p-4"
              type="tel"
              placeholder="Phone"
              value={company.phone}
              onChange={(event) =>
                updateCompany("phone", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              type="tel"
              placeholder="WhatsApp"
              value={company.whatsapp}
              onChange={(event) =>
                updateCompany(
                  "whatsapp",
                  event.target.value
                )
              }
            />

            <input
              className="rounded-xl border p-4"
              type="email"
              placeholder="Email"
              value={company.email}
              onChange={(event) =>
                updateCompany("email", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              type="url"
              placeholder="Website"
              value={company.website}
              onChange={(event) =>
                updateCompany(
                  "website",
                  event.target.value
                )
              }
            />
          </div>
        </section>

        {/* Company Address */}
        <section>
          <h2 className="mb-5 mt-10 text-2xl font-bold">
            Company Address
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <input
              className="rounded-xl border p-4"
              placeholder="Country"
              value={company.country}
              onChange={(event) =>
                updateCompany("country", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              placeholder="Province"
              value={company.province}
              onChange={(event) =>
                updateCompany("province", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              placeholder="District"
              value={company.district}
              onChange={(event) =>
                updateCompany("district", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              placeholder="Sector"
              value={company.sector}
              onChange={(event) =>
                updateCompany("sector", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              placeholder="Cell"
              value={company.cell}
              onChange={(event) =>
                updateCompany("cell", event.target.value)
              }
            />

            <input
              className="rounded-xl border p-4"
              placeholder="Village"
              value={company.village}
              onChange={(event) =>
                updateCompany("village", event.target.value)
              }
            />
          </div>
        </section>

        {/* Register Button */}
        <button
          type="button"
          onClick={saveCompany}
          disabled={loading}
          className="mt-10 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Register Company"}
        </button>
      </div>
    </main>
  );
}
```
