# My Navodaya – Product Requirements Document

Nov 7, 2026 · @poorvith

My Navodaya is a private, verified community site where Navodaya alumni find batchmates, share news, post jobs and host reunions. v1 launches for one school on Next.js, Postgres and Vercel at near-zero hosting cost.

## 1. Goals and non-goals

v1 replaces the live site with a simple, desktop-first, verified alumni network for one school, built so more schools can be added without a rewrite.

**Goals**

- Alumni sign in with a one-time code and find batchmates by name, batch, city or work.
- Members post and read jobs, stories/news and events, which are the three core activities.
- Every member is verified by a batch admin before they can post; unverified users can read only.
- Contact details are visible only to the groups each member chooses.
- Existing members and content move over from the live site.

**Non-goals for v1**

- No Instagram-style feed, likes or follower counts.
- No native mobile apps; the mobile web screens cover phones.
- No payments, ticketing or fundraising.
- No second school at launch, though the data model supports it.

## 2. Users and roles

Four roles cover v1; roles are scoped to a school or batch so a second school needs no new role model.

| Role | Scope | Can do |
| --- | --- | --- |
| Visitor | None | See the sign-in and join screens only |
| Pending member | Own request | Read content; cannot post, RSVP or message until verified |
| Member | Own school and batch | Post jobs, stories and events (after review); message; RSVP; edit own profile and privacy |
| Batch admin | One batch | Verify join requests for their batch; approve or reject jobs, stories and events from that batch |
| School admin | One school | Everything a batch admin can do for any batch; assign batch admins; handle disputes and profile change requests |
| Platform admin | All schools | Create schools, assign school admins, view audit logs (you, initially) |

Fallback: if a batch has no admin, its requests go to the school admin queue.

## 3. Scope

| Module | MVP (v1) | Later |
| --- | --- | --- |
| Auth | OTP by email, mobile OTP, optional password | Social sign-in |
| Join and verification | School/batch request, batch admin approval | Auto-match against migrated records |
| Home | Welcome, latest stories, upcoming events, new jobs, global search | Personalised suggestions |
| Jobs | Search, post, save, admin review | Referral requests, job alerts by email |
| News and stories | Write, submit for review, audience control, cover image | Comments, rich embeds |
| Events | Host, RSVP (Going, Maybe, Can't go), questions to host | Calendar export, reminders |
| People | Search and filter, profile with privacy | Map view, mentorship matching |
| Messages | One-to-one text messages | Group chats, attachments |
| Admin | Approval queues for members, jobs, stories, events | Analytics, bulk tools |
| Mobile web | Sign in, home, find classmates, events, me | Installable PWA with push |

## 4. Screens and requirements

Each of the 14 desktop and 3 mobile wireframes maps to one route and a set of requirements.

| # | Screen | Route | Key requirements |
| --- | --- | --- | --- |
| 1 | Sign in | /sign-in | Mobile or email, 6-digit code, "use a password instead" link, link to Join |
| 2 | Join | /join | School search, year joined, year left, optional admission number; creates a pending request |
| 3 | Home | / | Welcome with school and batch, latest stories, upcoming events, new jobs, global search |
| 4 | Jobs | /jobs | Keyword and city/remote search, filters, save, view job, shows who shared it |
| 5 | Post a job | /jobs/new | Title, filters, description, how to apply, save draft, goes to review |
| 6 | News and stories | /stories | List by type with cover image and author batch |
| 7 | Write a story | /stories/new | Type, headline, body, audience (all, school, batch), optional cover, submit for review |
| 8 | Events | /events | Date-led list, audience, going count, RSVP |
| 9 | Host an event | /events/new | Name, details, audience, live preview, publish |
| 10 | Event detail | /events/\[id\] | Details, questions to host, Going/Maybe/Can't go, see who's going |
| 11 | People | /people | Search by name, filters, message button |
| 12 | Member profile | /people/\[id\] | Role, organisation, stories, contact details shown per privacy choice |
| 13 | Messages | /messages | Thread list, search, conversation view, send |
| 14 | Profile and privacy | /me | Edit profile, photo, contact visibility (only me, batch, school, all), change request for verified school and batch, sign out |
| M1 | Mobile sign in | /sign-in | Same flow, single column |
| M2 | Mobile home | / | Share prompt, event card, member cards, bottom tabs: Home, People, Events, Me |
| M3 | Mobile find classmates | /people | Search plus Batch, School, City, Work chips |

**Cross-cutting:** the same routes serve desktop and mobile through responsive layouts; wireframes define desktop first.

## 5. Core workflows

All content (members, jobs, stories, events) follows one state machine: draft, pending review, published, or rejected with a reason.

**Join and verify**

1. Visitor enters school, joining year, leaving year and optional admission number.
2. The system creates a pending member and notifies the batch admin queue.
3. If the migrated records match (name plus batch), the request is flagged "likely match" for one-click approval.
4. Batch admin approves or rejects with a reason; the member gets an email or SMS either way.
5. Until approved the member can read but not post, RSVP or message.

**Post a job, story or event**

1. Member saves a draft and submits it.
2. Item appears in the batch admin queue; stories use the author's batch admin, events use the audience's admin.
3. Admin approves (item goes live, author notified) or rejects with a reason (author can edit and resubmit).
4. Admin-authored items skip review.

**Events and RSVP**

1. Host publishes; invited batch or school members see a notice.
2. Members answer Going, Maybe or Can't go; counts update immediately.
3. Members can ask the host questions on the event page.

**Messaging**

1. Member opens a profile and taps Message; a one-to-one thread is created.
2. Messages are stored and delivered in near real time; a new message sends an email notification if the recipient is offline.
3. Members can block or report a thread; reports go to the school admin.

## 6. Tech stack and architecture

One Next.js app on Vercel talks to one Supabase project (Postgres, auth, storage, realtime); there is no separate backend server to run.

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js (App Router), React, TypeScript | Matches your React experience; server rendering, routing and API routes in one repo |
| Styling | Tailwind CSS plus the wireframe tokens (Public Sans) | Fast to build the simple wireframe look; consistent across desktop and mobile |
| Database | Postgres on Supabase | Relational fit for members, batches, approvals; row-level security enforces privacy |
| Auth | Supabase Auth with email OTP; SMS OTP via MSG91 or Twilio | OTP sign-in per wireframe; SMS is the one paid part, so email is the default and SMS is optional |
| Files | Supabase Storage | Profile photos and story cover images; resized on upload |
| Messaging | Supabase Realtime | Live updates without running a WebSocket server |
| Email | Resend (free tier) | Approval notices, message alerts, event notices |
| Search | Postgres full-text and trigram indexes | Enough for one school; swap to Typesense if it outgrows this |
| Hosting | Vercel Hobby, GitHub for source and CI | Free tier, preview deployments per branch |
| Validation and data access | Zod, Drizzle or Prisma | Typed schemas shared by forms and server actions |
| Monitoring | Vercel Analytics, Sentry free tier | Errors and basic usage |

**Multi-school readiness:** every content table carries a school\_id, and row-level security filters on it, so adding a school is a data change, not a code change.

Note: Vercel's Hobby plan is for non-commercial use; if the site is run for a company or charges money, check the current terms and plan for Pro.

## 7. Data model

Ten core tables; every row that belongs to a community has a school\_id.

| Table | Key fields | Notes |
| --- | --- | --- |
| schools | id, name, region | One row at launch |
| batches | id, school\_id, year\_joined, year\_left | Batch admins attach here |
| members | id, auth\_user\_id, school\_id, batch\_id, name, role, organisation, city, photo, status | status: pending, verified, suspended |
| member\_privacy | member\_id, phone\_visibility, email\_visibility | Values: me, batch, school, all |
| admin\_roles | member\_id, scope (batch, school, platform), scope\_id | Drives review queues |
| jobs | id, author\_id, title, company, city, type, description, apply\_method, status | Plus saved\_jobs(member\_id, job\_id) |
| stories | id, author\_id, type, headline, body, cover, audience, status | audience: all, school, batch |
| events | id, host\_id, name, venue, city, starts\_at, audience, status | Plus rsvps(event\_id, member\_id, answer) and event\_questions |
| messages | id, thread\_id, sender\_id, body, sent\_at | threads(id, member\_a, member\_b) |
| reviews and reports | id, item\_type, item\_id, reviewer\_id, decision, reason | One audit log for approvals, rejections and reports |

Also: profile\_change\_requests for corrections to verified school and batch; legacy\_id columns on migrated rows.

## 8. Privacy, security and moderation

Privacy is enforced in the database with row-level security, not only in the interface.

- Contact details (phone, email) are returned only to the audience the member chose: only me, my batch, my school or all members.
- Only verified members can see the people directory; pending members see public-to-members content only.
- Stories and events honour their audience setting (all, school, batch) at query level.
- OTP codes expire in 10 minutes, are rate limited per number and IP, and lock after repeated failures.
- Admin actions are written to an audit log with who, what and when.
- Members can block another member and report content; reports go to the school admin.
- Uploaded images are type and size checked (JPEG, PNG, WebP, under 5 MB) and resized.
- Members can export or delete their data on request; deleting removes the profile and anonymises authored content.
- Messages are private to the two participants; admins cannot read them except through a reported thread.

## 9. Migration plan

Migrate in one scripted pass after the new site works on staging, then run both sites briefly side by side.

1. Get a database export or API access to the live site; list the tables and fields it holds (open question 1).
2. Map old fields to the new tables; record the old id in legacy\_id.
3. Clean data: merge duplicate members, normalise phone numbers and emails, map schools and years to batches.
4. Import members as unverified-but-known records. On first sign-in, the member confirms by OTP and is linked to their record; the batch admin sees them as "likely match".
5. Import approved jobs, stories, events and images; mark old content as published with its original date.
6. Dry run on staging, spot-check 50 records per table, fix the script, run again.
7. Cut over: freeze the old site, run the final import, switch the domain, keep the old site read-only for 30 days.

Rollback: the old site stays untouched until cutover is verified.

## 10. Non-functional requirements and free-tier limits

| Area | Requirement |
| --- | --- |
| Performance | Pages load in under 2.5 s on a mid-range phone over 4G; search results in under 500 ms |
| Availability | 99% monthly target; the free Supabase tier pauses idle projects, so add a weekly keep-alive or move to the paid tier before launch |
| Scale target | Plan for up to 20,000 members and 1,000 daily active users in year one |
| Accessibility | WCAG 2.1 AA: contrast, keyboard use, labelled forms |
| Browsers | Latest two versions of Chrome, Safari, Edge, Firefox; Android and iOS browsers |
| Languages | English at launch; text kept in translation files so Hindi or Kannada can follow |
| Backups | Daily database export to a private GitHub or storage bucket; test a restore once before launch |
| Cost | Hosting at 0 per month; SMS OTP is the only expected spend |

**Free-tier watch list** (approximate figures from memory; confirm current limits on each vendor's pricing page before launch):

- Supabase free: about 500 MB database, 1 GB file storage, 50,000 monthly active users, idle projects pause.
- Vercel Hobby: about 100 GB bandwidth a month, non-commercial use only.
- Resend free: about 3,000 emails a month and 100 a day, so batch notices as a digest.

Upgrade triggers: database above 400 MB, storage above 800 MB, or more than 2,000 emails in a month.

## 11. Milestones

Five phases, each ending in something you can demo; durations assume one developer working part-time and are estimates to confirm.

| Phase | Weeks | Deliverable | Done when |
| --- | --- | --- | --- |
| 0. Setup | 1 | Repo, Vercel, Supabase, design tokens, CI | A blank app deploys from GitHub with a preview URL |
| 1. Identity | 2-3 | Sign in, Join, verification queue, profile and privacy | A new member can join, be approved and edit their profile |
| 2. Directory | 2 | People, member profile, search, mobile find classmates | Search by name, batch, city and work works with privacy applied |
| 3. Content | 3-4 | Jobs, stories, events, RSVP, review queues, home | All three content types go draft, review, live |
| 4. Messages and notices | 2 | Messaging, email notices, block and report | Two members can chat; approvals send emails |
| 5. Migration and launch | 2-3 | Import script, QA, accessibility pass, cutover | Live data imported; domain switched; old site read-only |

Total: about 12 to 15 weeks.

## 12. Risks and open questions

**Risks**

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Batch admins are volunteers and queues stall | Members wait days to post | Email digest to admins, auto-escalate to school admin after 5 days |
| Old data is messy or incomplete | Failed matches, duplicate members | Dry runs, "likely match" review, keep legacy\_id |
| SMS OTP cost grows | Breaks the zero-cost goal | Email OTP by default; SMS only on request or with a daily cap |
| Free tiers pause or cap out | Site goes down | Keep-alive job, upgrade triggers, daily backups |
| Privacy leak through search | Trust loss | Row-level security tests; search only through privacy-aware views |

**Open questions**

- [ ] 1\. What does the live site run on, and can you get a database export or API access?
- [ ] 2\. Which school launches first, and how many members and batches does it have?
- [ ] 3\. Who are the first batch admins, and how are they chosen for later batches?
- [ ] 4\. Is SMS OTP required at launch, or is email OTP enough?
- [ ] 5\. Is the site non-commercial, and who owns the domain and hosting accounts (you, Fascinateit or the school)?
- [ ] 6\. What job and story types are needed (for example full-time, internship; news, story, achievement)?
- [ ] 7\. Is there a legal or school policy on storing alumni contact details and on minors' data?
- [ ] 8\. Should old admission numbers be used to auto-verify migrated members?
