"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Save, 
  LogOut,
  Shield
} from "lucide-react";
import { CURRENT_USER } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { Badge, HouseBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ProfileAndPrivacyPage() {
  const [profile, setProfile] = useState({
    name: CURRENT_USER.name,
    role: CURRENT_USER.role,
    organisation: CURRENT_USER.organisation,
    city: CURRENT_USER.city,
    bio: CURRENT_USER.bio,
    phoneVisibility: CURRENT_USER.phoneVisibility,
    emailVisibility: CURRENT_USER.emailVisibility,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Standardized Page Header */}
      <PageHeader
        tag="Account"
        meta="Settings"
        title="Profile & Privacy Controls"
        description="Manage your verified credentials, professional summary, and contact visibility."
        action={
          <Link
            href="/sign-in"
            className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors shrink-0 shadow-xs"
          >
            <LogOut size={13} />
            Sign out
          </Link>
        }
      />

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-700" />
          <span>Profile changes and privacy settings saved successfully.</span>
        </div>
      )}

      {/* 2-Column Split: 8 cols (Forms) / 4 cols (Sidebar Credentials) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column (8 cols): Edit Forms */}
        <div className="lg:col-span-8 space-y-6">
          
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Profile Info Form */}
            <Card className="p-6 space-y-4 bg-white">
              <h2 className="text-sm font-semibold text-zinc-900">Professional Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Current Location (City)
                  </label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Organisation / Company
                  </label>
                  <input
                    type="text"
                    value={profile.organisation}
                    onChange={(e) => setProfile({ ...profile, organisation: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Short Bio / Mentorship Areas
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors leading-relaxed"
                />
              </div>
            </Card>

            {/* Contact Visibility Controls */}
            <Card className="p-6 space-y-4 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Contact Visibility Controls</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Control who in the Navodaya network has permission to view your direct phone and email.
                  </p>
                </div>
                <Lock size={16} className="text-zinc-400" />
              </div>

              <div className="space-y-3 pt-2">
                
                {/* Phone Visibility */}
                <div className="p-3.5 bg-zinc-50/70 rounded-lg border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-zinc-900 flex items-center gap-1.5">
                      <Phone size={13} className="text-zinc-400" />
                      Phone Number ({CURRENT_USER.phone})
                    </div>
                    <div className="text-[11px] text-zinc-500">Who can see your direct phone number?</div>
                  </div>

                  <select
                    value={profile.phoneVisibility}
                    onChange={(e) => setProfile({ ...profile, phoneVisibility: e.target.value as any })}
                    className="px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg font-mono outline-none text-zinc-800 focus:border-orange-500"
                  >
                    <option value="me">Only Me (Hidden)</option>
                    <option value="batch">My Batch Only ({CURRENT_USER.batch})</option>
                    <option value="school">All MANAVI Alumni</option>
                    <option value="all">All Verified Navodaya Alumni</option>
                  </select>
                </div>

                {/* Email Visibility */}
                <div className="p-3.5 bg-zinc-50/70 rounded-lg border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-zinc-900 flex items-center gap-1.5">
                      <Mail size={13} className="text-zinc-400" />
                      Email Address ({CURRENT_USER.email})
                    </div>
                    <div className="text-[11px] text-zinc-500">Who can see your email address?</div>
                  </div>

                  <select
                    value={profile.emailVisibility}
                    onChange={(e) => setProfile({ ...profile, emailVisibility: e.target.value as any })}
                    className="px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg font-mono outline-none text-zinc-800 focus:border-orange-500"
                  >
                    <option value="me">Only Me (Hidden)</option>
                    <option value="batch">My Batch Only ({CURRENT_USER.batch})</option>
                    <option value="school">All MANAVI Alumni</option>
                    <option value="all">All Verified Navodaya Alumni</option>
                  </select>
                </div>

              </div>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                className="btn-press px-5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Save size={13} />
                Save Profile & Privacy
              </button>
            </div>

          </form>

        </div>

        {/* Right Column (4 cols): Verified Identity Card & Credentials */}
        <div className="lg:col-span-4 space-y-4">
          
          <Card className="p-6 space-y-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-mono text-base font-semibold shrink-0">
                {CURRENT_USER.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-zinc-900 text-sm">{CURRENT_USER.name}</h3>
                  <Badge variant="verified" size="sm">Verified</Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {CURRENT_USER.house && <HouseBadge house={CURRENT_USER.house} size="sm" />}
                  <span className="text-xs text-zinc-500 font-mono">
                    {CURRENT_USER.batch}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
              <div>
                <span className="text-zinc-400 font-mono uppercase text-[11px] block">School</span>
                <span className="font-medium text-zinc-800">{CURRENT_USER.school}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-mono uppercase text-[11px] block">Campus House</span>
                <span className="font-medium text-zinc-800">{CURRENT_USER.house} House</span>
              </div>
              <div>
                <span className="text-zinc-400 font-mono uppercase text-[11px] block">Role Scope</span>
                <span className="font-medium text-zinc-800">Batch Administrator</span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100">
              <span className="text-[11px] text-zinc-400 font-mono block mb-1">
                Need to correct school or batch record?
              </span>
              <button
                type="button"
                onClick={() => alert("Verification correction request submitted to school admin.")}
                className="text-xs text-orange-600 hover:underline font-medium"
              >
                Submit Correction Request →
              </button>
            </div>
          </Card>

          <div className="p-4 bg-white border border-zinc-200/80 rounded-xl text-xs text-zinc-600 space-y-1 shadow-xs">
            <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <Shield size={14} className="text-orange-600" />
              Privacy Protection
            </span>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Your phone number and email are visible only to the verified alumni groups you select above.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
