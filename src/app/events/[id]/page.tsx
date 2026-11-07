"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  Globe,
  MessageCircle, 
  Send, 
  ShieldCheck,
  CalendarPlus
} from "lucide-react";
import { MOCK_EVENTS, CURRENT_USER } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const event = MOCK_EVENTS.find((e) => e.id === resolvedParams.id);

  if (!event) {
    notFound();
  }

  const [userRsvp, setUserRsvp] = useState<"going" | "maybe" | "not_going" | undefined>(event.userRsvp);
  const [goingCount, setGoingCount] = useState(event.goingCount);
  const [questions, setQuestions] = useState(event.questions || []);
  const [newQuestion, setNewQuestion] = useState("");

  const handleRsvp = (answer: "going" | "maybe" | "not_going") => {
    if (userRsvp === answer) return;
    if (answer === "going") setGoingCount((prev) => prev + 1);
    if (userRsvp === "going" && answer !== "going") setGoingCount((prev) => prev - 1);
    setUserRsvp(answer);
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}`,
        author: CURRENT_USER.name,
        batch: CURRENT_USER.batch,
        question: newQuestion.trim(),
      },
    ]);
    setNewQuestion("");
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Standardized Page Header with Back Action */}
      <PageHeader
        tag="Events"
        meta={`${event.date} • ${event.city}`}
        title={event.title}
        description={`Organised by ${event.host.name} (${event.host.batch})`}
        action={
          <Link
            href="/events"
            className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200"
          >
            <ArrowLeft size={14} className="text-zinc-500" />
            Back to Events
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column (8 cols): Event Details & Q&A */}
        <div className="lg:col-span-8 space-y-6">
          
          <Card className="p-6 sm:p-8 space-y-6 bg-white">
            
            {/* Header Details */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-medium text-xs text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60 inline-flex items-center gap-1">
                  <Calendar size={11} className="shrink-0" />
                  {event.date}
                </span>
                <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                  <Clock size={12} className="shrink-0" />
                  {event.time}
                </span>
                <Badge variant="neutral" size="sm">
                  {event.audience === "batch" ? (
                    <>
                      <Users size={11} className="shrink-0" />
                      Batch Only
                    </>
                  ) : (
                    <>
                      <Globe size={11} className="shrink-0" />
                      All Alumni
                    </>
                  )}
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
                {event.title}
              </h2>

              <div className="flex items-center gap-1.5 text-sm text-zinc-500 pt-1">
                <MapPin size={15} className="text-zinc-400 shrink-0" />
                <span>{event.venue} • {event.city}</span>
              </div>
            </div>

            {/* RSVP Interaction Banner */}
            <div className="p-4 sm:p-5 bg-zinc-50/70 rounded-xl border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs">
                <div className="font-semibold text-zinc-900 text-sm">
                  Are you attending this reunion?
                </div>
                <p className="text-zinc-600 mt-0.5">
                  <span className="font-mono font-semibold text-zinc-900">{goingCount}</span> alumni confirmed going
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRsvp("going")}
                  className={`btn-press px-4 py-2 rounded-lg text-xs font-medium ${
                    userRsvp === "going"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  Going
                </button>
                <button
                  onClick={() => handleRsvp("maybe")}
                  className={`btn-press px-4 py-2 rounded-lg text-xs font-medium ${
                    userRsvp === "maybe"
                      ? "bg-zinc-800 text-white"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  Maybe
                </button>
                <button
                  onClick={() => handleRsvp("not_going")}
                  className={`btn-press px-4 py-2 rounded-lg text-xs font-medium ${
                    userRsvp === "not_going"
                      ? "bg-red-600 text-white"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  Can't Go
                </button>
              </div>
            </div>

            {/* Description & Agenda */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Event Description & Plan
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Host Info */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span>Organised by: <strong className="text-zinc-900">{event.host.name}</strong> ({event.host.batch})</span>
              <span className="font-mono">Open to verified alumni</span>
            </div>

          </Card>

          {/* Questions to Host Section */}
          <Card className="p-6 space-y-4 bg-white">
            <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <MessageCircle size={16} />
              Questions & Queries to Host
            </h3>

            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="p-3.5 bg-zinc-50/70 rounded-lg border border-zinc-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900">{q.author}</span>
                    <span className="text-zinc-400 font-mono">{q.batch}</span>
                  </div>
                  <p className="text-sm text-zinc-700">{q.question}</p>
                  {q.answer && (
                    <div className="mt-2 pt-2 border-t border-zinc-200 text-xs text-zinc-600 bg-white p-2.5 rounded-md">
                      <span className="font-medium text-orange-700 block mb-0.5">Host response:</span>
                      {q.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Ask question form */}
            <form onSubmit={handlePostQuestion} className="pt-3 border-t border-zinc-100 flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask the organising committee a question regarding accommodation, travel..."
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-lg outline-none focus:border-orange-500 text-zinc-900 placeholder:text-zinc-400 transition-colors"
              />
              <button
                type="submit"
                className="btn-press px-4 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg inline-flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Send size={13} />
                Ask
              </button>
            </form>
          </Card>

        </div>

        {/* Right Column (4 cols): Venue & Host Info Card */}
        <div className="lg:col-span-4 space-y-4">
          
          <Card className="p-5 space-y-4 bg-white">
            <h3 className="text-sm font-semibold text-zinc-900">Location & Logistics</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-400 font-mono uppercase text-[10px] block">Venue</span>
                  <span className="font-semibold text-zinc-900">{event.venue}</span>
                  <span className="text-zinc-500 block mt-0.5">{event.city}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2.5 border-t border-zinc-100">
                <Calendar size={15} className="text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-400 font-mono uppercase text-[10px] block">Date & Time</span>
                  <span className="font-semibold text-zinc-900">{event.date}</span>
                  <span className="text-zinc-500 block mt-0.5">{event.time}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => alert("Added to calendar (.ics)")}
                className="btn-press w-full py-2 text-xs font-medium text-center text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg flex items-center justify-center gap-1.5 border border-zinc-200"
              >
                <CalendarPlus size={14} />
                Add to Calendar
              </button>
            </div>
          </Card>

          <div className="p-4 bg-white border border-zinc-200/80 rounded-xl text-xs text-zinc-600 flex items-start gap-2.5 shadow-xs">
            <ShieldCheck size={16} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900">Verified Campus Event</span>
              <p className="text-zinc-600 mt-0.5 leading-relaxed text-[11px]">
                Coordination is handled by the alumni steering committee.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
