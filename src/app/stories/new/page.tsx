"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Send,
  BookOpen,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { storyPostSchema } from "@/lib/validations";

export default function WriteStoryPage() {
  const [formData, setFormData] = useState({
    headline: "",
    type: "news" as const,
    audience: "school" as const,
    body: "",
    coverImage: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = storyPostSchema.safeParse(formData);
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
        <h1 className="text-xl font-semibold text-zinc-900">Story Submitted for Review</h1>
        <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
          Your story has been submitted. Once verified by your batch administrator, it will be published to the community.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/stories"
            className="px-4 py-2 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-xs"
          >
            Back to Stories
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                headline: "",
                type: "news",
                audience: "school",
                body: "",
                coverImage: "",
              });
            }}
            className="px-4 py-2 text-xs font-medium bg-white text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50"
          >
            Write Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Standardized Page Header with Back Action */}
      <PageHeader
        tag="Stories"
        meta="New Article"
        title="Write an Alumni Story"
        description="Share batch milestones, alumni achievements, campus reunions, or memoirs."
        action={
          <Link
            href="/stories"
            className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-200 shadow-xs"
          >
            <ArrowLeft size={14} className="text-zinc-500" />
            Back to Stories
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Form Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-7 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Headline *
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Batch of 2008 Launches Rural Scholarship Initiative"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
                {errors.headline && <p className="text-xs text-red-600 mt-1">{errors.headline}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <option value="news">News & Updates</option>
                    <option value="achievement">Alumni Achievement</option>
                    <option value="memoir">Campus Memoir</option>
                    <option value="general">General Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Audience Visibility
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <option value="all">All Navodaya Network (Public)</option>
                    <option value="school">MANAVI School Alumni Only</option>
                    <option value="batch">My Batch Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Story Body *
                </label>
                <textarea
                  rows={8}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Write your story here. Be factual, authentic, and celebrate community accomplishments..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors leading-relaxed"
                />
                {errors.body && <p className="text-xs text-red-600 mt-1">{errors.body}</p>}
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                <Link
                  href="/stories"
                  className="btn-press px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn-press px-5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Send size={13} />
                  Submit for Verification
                </button>
              </div>

            </form>
          </Card>
        </div>

        {/* Right Guidelines (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-3 text-xs text-zinc-600 bg-white">
            <h3 className="font-semibold text-zinc-900 text-sm flex items-center gap-1.5">
              <BookOpen size={14} className="text-orange-600" />
              Editorial Guidelines
            </h3>
            <p className="leading-relaxed">
              MANAVI preserves authentic records of alumni milestones. Write in your natural voice and celebrate the real people involved.
            </p>
            <div className="pt-2 border-t border-zinc-100 space-y-2.5">
              <div>
                <strong className="text-zinc-900 block font-mono text-[11px] uppercase">Batch Mentions</strong>
                <span>Include batch year (e.g. '12) so batchmates can be tagged in the directory.</span>
              </div>
              <div>
                <strong className="text-zinc-900 block font-mono text-[11px] uppercase">Audience Privacy</strong>
                <span>Stories marked "My Batch Only" are invisible to other batches.</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
