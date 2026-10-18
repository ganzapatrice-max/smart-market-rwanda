"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

const CLOUD_NAME = "dmebligcw";
const UPLOAD_PRESET = "quickfix";

const inputClass =
  "w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3.5 text-white placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-200";

const sectionTitleClass =
  "mb-5 text-xl font-bold text-white sm:text-2xl";

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

    return data.secure_url as string;
  };

  const saveCompany = async () => {
    if (!company.name.trim()) {
      alert("Please enter your company name.");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

if (!user) {
  alert("Please log in before registering your company.");
  window.location.href = "/login";
  return;
}

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

      const companyRef = await addDoc(collection(db, "companies"), {
  ...company,
  ownerUid: user.uid,
  ownerEmail: user.email || "",
  logo: logoUrl,
  cover: coverUrl,
  gallery: galleryUrls,
  verified: false,
  rating: 0,
  jobs: 0,
  createdAt: serverTimestamp(),
});

      alert("Company registered successfully!");
     window.location.href = `/company/dashboard?companyId=${companyRef.id}`;
    } catch (err) {
      console.error(err);
      alert("Failed to register company. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <header className="mb-8 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
            Smart Market Rwanda
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Register Your Company
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            Create your company profile, showcase your business,
            and connect with customers and job seekers.
          </p>
        </header>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
          {/* Company images */}
          <section>
            <h2 className={sectionTitleClass}>
              <span className="mr-2 text-blue-400">01.</span>
              Company Images
            </h2>

            <p className="mb-6 text-sm text-slate-400">
              Upload your logo, cover image, and optional gallery photos.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setLogo(e.target.files?.[0] || null)
                  }
                  className={inputClass}
                />
                {logo && (
                  <p className="mt-2 text-xs text-blue-300">
                    Selected: {logo.name}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCover(e.target.files?.[0] || null)
                  }
                  className={inputClass}
                />
                {cover && (
                  <p className="mt-2 text-xs text-blue-300">
                    Selected: {cover.name}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Gallery Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setGallery(Array.from(e.target.files || []))
                  }
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {gallery.length} gallery image
                  {gallery.length === 1 ? "" : "s"} selected
                </p>
              </div>
            </div>
          </section>

          <div className="my-9 border-t border-slate-800" />

          {/* Company information */}
          <section>
            <h2 className={sectionTitleClass}>
              <span className="mr-2 text-blue-400">02.</span>
              Company Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Company Name *</label>
                <input
                  required
                  className={inputClass}
                  placeholder="Enter company name"
                  value={company.name}
                  onChange={(e) =>
                    updateCompany("name", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  Registration Number
                </label>
                <input
                  className={inputClass}
                  placeholder="Business registration number"
                  value={company.registrationNumber}
                  onChange={(e) =>
                    updateCompany("registrationNumber", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Industry</label>
                <input
                  className={inputClass}
                  placeholder="Industry"
                  value={company.industry}
                  onChange={(e) =>
                    updateCompany("industry", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Founded Year</label>
                <input
                  className={inputClass}
                  placeholder="e.g. 2020"
                  value={company.founded}
                  onChange={(e) =>
                    updateCompany("founded", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Number of Employees</label>
                <input
                  className={inputClass}
                  placeholder="e.g. 10-50"
                  value={company.employees}
                  onChange={(e) =>
                    updateCompany("employees", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="mt-5">
              <label className={labelClass}>Company Description</label>
              <textarea
                rows={5}
                className={inputClass}
                placeholder="Describe your company, services, and experience..."
                value={company.description}
                onChange={(e) =>
                  updateCompany("description", e.target.value)
                }
              />
            </div>
          </section>

          <div className="my-9 border-t border-slate-800" />

          {/* Contact information */}
          <section>
            <h2 className={sectionTitleClass}>
              <span className="mr-2 text-blue-400">03.</span>
              Contact Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="Company phone number"
                  value={company.phone}
                  onChange={(e) =>
                    updateCompany("phone", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>WhatsApp</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="WhatsApp number"
                  value={company.whatsapp}
                  onChange={(e) =>
                    updateCompany("whatsapp", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="company@example.com"
                  value={company.email}
                  onChange={(e) =>
                    updateCompany("email", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Website</label>
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://example.com"
                  value={company.website}
                  onChange={(e) =>
                    updateCompany("website", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <div className="my-9 border-t border-slate-800" />

          {/* Address */}
          <section>
            <h2 className={sectionTitleClass}>
              <span className="mr-2 text-blue-400">04.</span>
              Company Address
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Country</label>
                <input
                  className={inputClass}
                  placeholder="Country"
                  value={company.country}
                  onChange={(e) =>
                    updateCompany("country", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Province</label>
                <input
                  className={inputClass}
                  placeholder="Province"
                  value={company.province}
                  onChange={(e) =>
                    updateCompany("province", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>District</label>
                <input
                  className={inputClass}
                  placeholder="District"
                  value={company.district}
                  onChange={(e) =>
                    updateCompany("district", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Sector</label>
                <input
                  className={inputClass}
                  placeholder="Sector"
                  value={company.sector}
                  onChange={(e) =>
                    updateCompany("sector", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Cell</label>
                <input
                  className={inputClass}
                  placeholder="Cell"
                  value={company.cell}
                  onChange={(e) =>
                    updateCompany("cell", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Village</label>
                <input
                  className={inputClass}
                  placeholder="Village"
                  value={company.village}
                  onChange={(e) =>
                    updateCompany("village", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="mt-10 border-t border-slate-800 pt-8">
            <p className="mb-5 text-sm leading-6 text-slate-400">
              Please review your information before registering your company.
              Fields marked with * are required.
            </p>

            <button
              type="button"
              onClick={saveCompany}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Registering Company...
                </>
              ) : (
                "Register Company"
              )}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Smart Market Rwanda · Company Registration
        </p>
      </div>
    </main>
  );
}