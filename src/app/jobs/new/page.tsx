"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Send,
  Briefcase,
  ShieldCheck
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { jobPostSchema } from "@/lib/validations";

export default function PostJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    city: "",
    type: "Full-time" as const,
    experienceLevel: "Mid-Senior (4-8 yrs)" as const,
    description: "",
    applyMethod: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = jobPostSchema.safeParse(formData);
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle2 size={24} />
        </div>
        <h1 className="text-xl font-semibold text-zinc-900">Opportunity Submitted for Review</h1>
        <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
          Your job posting has been submitted for review. Once verified, it will be published to the community jobs board.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="px-4 py-2 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-xs"
          >
            Back to Jobs
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                title: "",
                company: "",
                city: "",
                type: "Full-time",
                experienceLevel: "Mid-Senior (4-8 yrs)",
                description: "",
                applyMethod: "",
              });
            }}
            className="px-4 py-2 text-xs font-medium bg-white text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50"
          >
            Post Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Standardized Page Header with Back Action */}
      <PageHeader
        tag="Careers"
        meta="New Opportunity"
        title="Post an Alumni Opportunity"
        description="Share job openings, internships, or direct referrals with the Navodaya community."
        action={
          <Link
            href="/jobs"
            className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-200 shadow-xs"
          >
            <ArrowLeft size={14} className="text-zinc-500" />
            Back to Jobs
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Main Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-7 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Role Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Software Architect, Resident Doctor, Policy Analyst"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. AgriNext Labs, Apollo Hospitals"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Location (City or 'Remote') *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru, Remote, Hyderabad"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Employment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="Mid-Senior (4-8 yrs)">Mid-Senior (4-8 yrs)</option>
                    <option value="Lead / Executive (8+ yrs)">Lead / Executive (8+ yrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Role Description & Key Requirements *
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline the day-to-day responsibilities, required skills, and why alumni should apply..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors leading-relaxed"
                />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  How to Apply (URL or Contact Email) *
                </label>
                <input
                  type="text"
                  value={formData.applyMethod}
                  onChange={(e) => setFormData({ ...formData, applyMethod: e.target.value })}
                  placeholder="e.g. careers@company.com or https://company.com/apply"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono text-xs"
                />
                {errors.applyMethod && <p className="text-xs text-red-600 mt-1">{errors.applyMethod}</p>}
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                <Link
                  href="/jobs"
                  className="btn-press px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn-press px-5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Send size={13} />
                  Submit for Admin Review
                </button>
              </div>

            </form>
          </Card>
        </div>

        {/* Right Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-orange-50/60 border border-orange-200/70 rounded-xl text-xs text-orange-950 space-y-1">
            <span className="font-semibold text-orange-900 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-orange-600" />
              Moderated Board
            </span>
            <p className="text-orange-800/90 leading-relaxed text-[11px]">
              To maintain high community standards and prevent recruitment spam, all job listings are verified by your batch administrator before publishing.
            </p>
          </div>

          <Card className="p-5 space-y-3 text-xs text-zinc-600 bg-white">
            <h3 className="font-semibold text-zinc-900 text-sm flex items-center gap-1.5">
              <Briefcase size={14} className="text-orange-600" />
              Alumni Referral Tips
            </h3>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
              <li>Mention if your company offers interview fast-tracking for Navodayans</li>
              <li>Provide a direct internal referral email where possible</li>
              <li>Specify remote flexibility and work authorization details</li>
            </ul>
          </Card>
        </div>

      </div>

    </div>
  );
}
