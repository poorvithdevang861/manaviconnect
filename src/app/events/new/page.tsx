"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Send
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { eventHostSchema } from "@/lib/validations";

export default function HostEventPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    venue: "",
    city: "",
    startsAt: "",
    audience: "school" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = eventHostSchema.safeParse(formData);
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
        <h1 className="text-xl font-semibold text-zinc-900">Reunion Scheduled</h1>
        <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
          Your event has been scheduled. Batch members will be notified and can RSVP immediately.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/events"
            className="px-4 py-2 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-xs"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Standardized Page Header with Back Action */}
      <PageHeader
        tag="Reunions"
        meta="New Gathering"
        title="Host a Reunion or Meetup"
        description="Coordinate batch decennials, city chapter breakfasts, or campus gatherings."
        action={
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-200"
          >
            <ArrowLeft size={14} className="text-zinc-500" />
            Back to Events
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
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Class of 2012 Decennial Reunion"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Venue Location *
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. School Quadrangle, Cubbon Park"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  {errors.venue && <p className="text-xs text-red-600 mt-1">{errors.venue}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    City / Campus *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Campus Grounds, Bengaluru, Mysuru"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Date and Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono text-xs"
                  />
                  {errors.startsAt && <p className="text-xs text-red-600 mt-1">{errors.startsAt}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Audience
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <option value="school">All MANAVI Alumni</option>
                    <option value="batch">My Batch Only</option>
                    <option value="all">All Navodaya Network</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Event Details & Agenda *
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline the schedule, accommodation arrangements, family/spouse invite details..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors leading-relaxed"
                />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                <Link
                  href="/events"
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Send size={13} />
                  Schedule Event
                </button>
              </div>

            </form>
          </Card>
        </div>

        {/* Right Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-3 text-xs text-zinc-600 bg-white">
            <h3 className="font-semibold text-zinc-900 text-sm">Host Checklist</h3>
            <ul className="space-y-2 list-disc pl-4 text-[11px] leading-relaxed">
              <li>Confirm capacity and catering estimate</li>
              <li>Provide local contact for outstation batchmates</li>
              <li>Notify batch admin for campus guest room reservations</li>
            </ul>
          </Card>
        </div>

      </div>

    </div>
  );
}
