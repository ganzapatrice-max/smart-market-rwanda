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
  const [loading, setLoading] = useState(false);

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

  const updateCompany = (
    field: keyof typeof company,
    value: string
  ) => {
    setCompany((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await res.json();

    return data.secure_url;
  };

  const saveCompany = async () => {
    try {
      setLoading(true);

      let logoUrl = "";
      let coverUrl = "";

      if (logo) {
        logoUrl = await uploadImage(logo);
      }

      if (cover) {
        coverUrl = await uploadImage(cover);
      }

      const galleryUrls: string[] = [];

      for (const image of gallery) {
        const url = await uploadImage(image);
        galleryUrls.push(url);
      }

      await addDoc(collection(db, "companies"), {
        ...company,
        logo: logoUrl,
        cover: coverUrl,
        gallery: galleryUrls,
        verified: false,
        rating: 0,
        jobs: 0,
        createdAt: serverTimestamp(),
      });

      alert("Company registered successfully!");

      window.location.href = "/company";
    } catch (err) {
      console.error(err);
      alert("Failed to register company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-center mb-2">
          Register Company
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Complete your company profile.
        </p>

        <h2 className="text-2xl font-bold mb-5">
          Company Images
        </h2>

        <div className="space-y-6">

          <div>
            <label className="font-semibold block mb-2">
              Company Logo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setLogo(e.target.files?.[0] || null)
              }
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Cover Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCover(e.target.files?.[0] || null)
              }
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Gallery Images
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setGallery(Array.from(e.target.files || []))
              }
              className="w-full border rounded-xl p-3"
            />
          </div>

        </div>

        <h2 className="text-2xl font-bold mt-10 mb-5">
          Company Information
        </h2>

        <div className="grid md:grid-cols-2 gap-5">

          <input
            className="border rounded-xl p-4"
            placeholder="Company Name"
            value={company.name}
            onChange={(e) =>
              updateCompany("name", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Registration Number"
            value={company.registrationNumber}
            onChange={(e) =>
              updateCompany(
                "registrationNumber",
                e.target.value
              )
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Industry"
            value={company.industry}
            onChange={(e) =>
              updateCompany("industry", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Founded Year"
            value={company.founded}
            onChange={(e) =>
              updateCompany("founded", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Employees"
            value={company.employees}
            onChange={(e) =>
              updateCompany("employees", e.target.value)
            }
          />

        </div>

        <textarea
          rows={5}
          className="border rounded-xl p-4 w-full mt-5"
          placeholder="Company Description"
          value={company.description}
          onChange={(e) =>
            updateCompany("description", e.target.value)
          }
        />

        <h2 className="text-2xl font-bold mt-10 mb-5">
          Contact Information
        </h2>

        <div className="grid md:grid-cols-2 gap-5">

          <input
            className="border rounded-xl p-4"
            placeholder="Phone"
            value={company.phone}
            onChange={(e) =>
              updateCompany("phone", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="WhatsApp"
            value={company.whatsapp}
            onChange={(e) =>
              updateCompany("whatsapp", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Email"
            value={company.email}
            onChange={(e) =>
              updateCompany("email", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Website"
            value={company.website}
            onChange={(e) =>
              updateCompany("website", e.target.value)
            }
          />

        </div>

        <h2 className="text-2xl font-bold mt-10 mb-5">
          Address
        </h2>

        <div className="grid md:grid-cols-2 gap-5">

          <input
            className="border rounded-xl p-4"
            placeholder="Country"
            value={company.country}
            onChange={(e) =>
              updateCompany("country", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Province"
            value={company.province}
            onChange={(e) =>
              updateCompany("province", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="District"
            value={company.district}
            onChange={(e) =>
              updateCompany("district", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Sector"
            value={company.sector}
            onChange={(e) =>
              updateCompany("sector", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Cell"
            value={company.cell}
            onChange={(e) =>
              updateCompany("cell", e.target.value)
            }
          />

          <input
            className="border rounded-xl p-4"
            placeholder="Village"
            value={company.village}
            onChange={(e) =>
              updateCompany("village", e.target.value)
            }
          />

        </div>

        <button
          onClick={saveCompany}
          disabled={loading}
          className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl"
        >
          {loading ? "Registering..." : "Register Company"}
        </button>

      </div>
    </main>
  );
}