"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  CheckCircle2, 
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { joinRequestSchema } from "@/lib/validations";

export default function JoinPage() {
  const [formData, setFormData] = useState({
    schoolName: "MANAVI",
    yearJoined: 2007,
    yearLeft: 2014,
    house: "Aravali" as "Aravali" | "Nilgiri" | "Shivalik" | "Udaygiri",
    admissionNumber: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    role: "",
    organisation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = joinRequestSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#fafafa] text-center">
        <Card className="w-full max-w-md p-8 space-y-4 bg-white border border-zinc-200/80 rounded-xl shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">Join Request Submitted</h1>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Your verification request has been queued for your batch administrator (Class of {formData.yearLeft}). You will receive an approval notification at <strong className="text-zinc-900">{formData.email}</strong>.
          </p>
          <div className="pt-4">
            <Link
              href="/sign-in"
              className="btn-press inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-xs"
            >
              Return to Sign In
              <ArrowRight size={13} />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#fafafa]">
      
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            M
          </div>
          <span className="font-semibold text-2xl tracking-tight text-zinc-900">
            MANAVI
          </span>
        </Link>
        <p className="text-xs text-zinc-500 mt-1 font-mono">
          Navodaya Alumni Verification & Registration
        </p>
      </div>

      <Card className="w-full max-w-xl p-6 sm:p-8 space-y-6 bg-white border border-zinc-200/80 rounded-xl shadow-xs">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Request Alumni Membership</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Submit your details for batch verification. Unverified accounts have read-only access until verified.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* School & Batch */}
          <div className="p-4 bg-zinc-50/70 rounded-xl border border-zinc-200/80 space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                Alumni Network School
              </label>
              <input
                type="text"
                disabled
                value="MANAVI (Jawahar Navodaya Vidyalaya)"
                className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg font-medium text-zinc-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                  Year Joined (Class 6) *
                </label>
                <input
                  type="number"
                  value={formData.yearJoined}
                  onChange={(e) => setFormData({ ...formData, yearJoined: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg outline-none font-mono text-zinc-900 focus:border-orange-500"
                />
                {errors.yearJoined && <p className="text-[11px] text-red-600 mt-0.5">{errors.yearJoined}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                  Year Left / Passed Out *
                </label>
                <input
                  type="number"
                  value={formData.yearLeft}
                  onChange={(e) => setFormData({ ...formData, yearLeft: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg outline-none font-mono text-zinc-900 focus:border-orange-500"
                />
                {errors.yearLeft && <p className="text-[11px] text-red-600 mt-0.5">{errors.yearLeft}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                  Campus House *
                </label>
                <select
                  value={formData.house}
                  onChange={(e) => setFormData({ ...formData, house: e.target.value as any })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg outline-none font-mono text-zinc-900 focus:border-orange-500"
                >
                  <option value="Aravali">Aravali House</option>
                  <option value="Nilgiri">Nilgiri House</option>
                  <option value="Shivalik">Shivalik House</option>
                  <option value="Udaygiri">Udaygiri House</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-500 uppercase mb-1">
                  Admission / Roll No. (Optional)
                </label>
                <input
                  type="text"
                  value={formData.admissionNumber}
                  onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                  placeholder="e.g. 1420"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg outline-none font-mono text-zinc-900 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name as in school records"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg outline-none focus:border-orange-500 text-zinc-900"
              />
              {errors.name && <p className="text-[11px] text-red-600 mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@email.com"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg outline-none focus:border-orange-500 text-zinc-900"
              />
              {errors.email && <p className="text-[11px] text-red-600 mt-0.5">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Mobile Number (for SMS OTP)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg outline-none focus:border-orange-500 font-mono text-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Current City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Bengaluru, Hyderabad, London"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg outline-none focus:border-orange-500 text-zinc-900"
              />
              {errors.city && <p className="text-[11px] text-red-600 mt-0.5">{errors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Current Role / Profession
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Cardiologist, Software Architect"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg outline-none focus:border-orange-500 text-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Organisation / Company
              </label>
              <input
                type="text"
                value={formData.organisation}
                onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                placeholder="e.g. Apollo, TCS, IAS"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg outline-none focus:border-orange-500 text-zinc-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="btn-press w-full py-2.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs"
            >
              Submit Membership Request
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
          Already registered?{" "}
          <Link href="/sign-in" className="text-orange-600 font-medium hover:underline">
            Sign In here
          </Link>
        </div>
      </Card>

    </div>
  );
}
