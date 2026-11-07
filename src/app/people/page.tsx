"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, GraduationCap, Compass, ShieldCheck, Award } from "lucide-react";
import { MOCK_MEMBERS } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";

const BATCH_FILTERS = ["All Batches", "2007-2009", "2010-2013", "2014-2016", "2017+"];
const HOUSE_FILTERS = ["All Houses", "Aravali", "Nilgiri", "Shivalik", "Udaygiri"];

export default function PeopleDirectoryPage() {
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [selectedHouse, setSelectedHouse] = useState("All Houses");

  const filteredMembers = MOCK_MEMBERS.filter((m) => {
    const matchesSearch =
      search.trim() === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.organisation.toLowerCase().includes(search.toLowerCase()) ||
      m.city.toLowerCase().includes(search.toLowerCase());

    const matchesHouse =
      selectedHouse === "All Houses" || m.house === selectedHouse;

    let matchesBatch = true;
    if (selectedBatch === "2007-2009") {
      matchesBatch = m.batchYear >= 2007 && m.batchYear <= 2009;
    } else if (selectedBatch === "2010-2013") {
      matchesBatch = m.batchYear >= 2010 && m.batchYear <= 2013;
    } else if (selectedBatch === "2014-2016") {
      matchesBatch = m.batchYear >= 2014 && m.batchYear <= 2016;
    } else if (selectedBatch === "2017+") {
      matchesBatch = m.batchYear >= 2017;
    }

    return matchesSearch && matchesHouse && matchesBatch;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Standardized Page Header */}
      <PageHeader
        tag="Directory"
        meta={`${MOCK_MEMBERS.length} Verified Alumni`}
        title="Alumni Directory"
        description="Search alumni across batches, professions, and locations."
      />

      {/* Search and Filters */}
      <div className="space-y-3 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni by name, company, medical/civil services, or city..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/60 hover:bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-orange-500 rounded-lg outline-none transition-colors placeholder:text-zinc-400"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-zinc-500 mr-1 font-medium flex items-center gap-1">
            <GraduationCap size={13} className="text-zinc-400" />
            Batch:
          </span>
          {BATCH_FILTERS.map((batch) => (
            <button
              key={batch}
              onClick={() => setSelectedBatch(batch)}
              className={`chip-press px-2.5 py-1 rounded-lg font-mono transition-colors ${
                selectedBatch === batch
                  ? "bg-orange-50 text-orange-700 font-semibold border border-orange-200/80 shadow-xs"
                  : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {batch}
            </button>
          ))}

          <span className="text-zinc-500 ml-3 mr-1 font-medium flex items-center gap-1">
            <Compass size={13} className="text-zinc-400" />
            House:
          </span>
          {HOUSE_FILTERS.map((house) => (
            <button
              key={house}
              onClick={() => setSelectedHouse(house)}
              className={`chip-press px-2.5 py-1 rounded-lg font-mono transition-colors ${
                selectedHouse === house
                  ? "bg-orange-50 text-orange-700 font-semibold border border-orange-200/80 shadow-xs"
                  : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {house}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid: 1 / 2 / 3 / 4 columns */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-12 text-center shadow-xs">
          <p className="text-sm text-zinc-500">No batchmates found matching your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedBatch("All Batches");
              setSelectedHouse("All Houses");
            }}
            className="btn-press mt-3 text-xs font-semibold text-orange-600 hover:underline inline-block"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="p-5 flex flex-col justify-between bg-white group" hoverable>
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-mono text-sm font-semibold shrink-0 transition-transform group-hover:scale-105">
                    {member.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/people/${member.id}`}>
                      <h3 className="font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors text-sm truncate">
                        {member.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Badge variant="brand" size="sm">
                        <GraduationCap size={11} className="shrink-0" />
                        {member.batch}
                      </Badge>
                      {member.house && (
                        <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-0.5">
                          <Compass size={10} className="shrink-0" />
                          {member.house}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-0.5 text-xs text-zinc-500">
                  <div className="font-semibold text-zinc-800">{member.role}</div>
                  <div className="truncate">{member.organisation}</div>
                  <div>{member.city}</div>
                </div>

                <p className="mt-2.5 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <Link
                  href={`/people/${member.id}`}
                  className="font-medium text-zinc-600 hover:text-orange-600 transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  href="/messages"
                  className="btn-press px-2.5 py-1 font-medium text-orange-700 bg-orange-50 hover:bg-orange-100/70 border border-orange-200/70 rounded-lg"
                >
                  Message
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
