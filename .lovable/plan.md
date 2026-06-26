# Phase 1: Core Learning Platform (LMS)

Goal: move the highest-value, most-feasible chunk of Kajabi — paid course delivery — onto your own platform, reusing the auth, certificates, and payments primitives you already own. Email marketing, newsletters, and complex automations stay on a dedicated tool for now.

## What students will be able to do

```text
Sign up / log in  ──►  My Learning (dashboard)
                          │
                          ├─► Course page (modules + lessons list, % progress)
                          │       └─► Lesson player (video + rich text + resources)
                          │               └─► Mark complete  ──► progress saved
                          │
                          ├─► Quiz at end of module ──► pass/score recorded
                          │
                          └─► On full completion ──► Certificate auto-issued
                                                     (reuses existing cert system)

Buy course ──► Stripe/Paddle checkout ──► access unlocked automatically
```

## Scope of this phase

Included:
- Student accounts (email/password + Google), separate from the existing admin login
- Course → Module → Lesson content hierarchy with ordering and optional drip
- Lesson player: embedded video (Vimeo/Bunny/Mux/YouTube-unlisted), rich text, downloadable resources
- Per-student progress tracking and resume-where-you-left-off
- Quizzes per module (reuses your assessment patterns), score + pass/fail recorded
- Paid access gating via built-in payments; purchase unlocks the right course
- Auto-issue certificate on course completion (reuses certificates + QR verification you already have)
- Admin authoring screens to create/edit courses, modules, lessons, and quizzes

Explicitly NOT in this phase (kept on existing tools):
- Bulk email marketing & newsletters (not supported here — keep Mailchimp/Beehiiv/etc.)
- Community/forum (Phase 2)
- Visual automation/workflow builder (Phase 2; simple signup→access→welcome triggers are included)

## Data model (new tables)

All in `public`, with RLS + GRANTs. Roles via the existing `user_roles` table.

- `courses` — title, slug, description, cover image, price, published flag
- `modules` — course_id, title, position, drip_days (offset from enrolment)
- `lessons` — module_id, title, position, video_url, body (rich text), resources (json), duration
- `enrollments` — user_id, course_id, status, enrolled_at, completed_at
- `lesson_progress` — user_id, lesson_id, completed_at
- `quizzes` — module_id, title, pass_threshold
- `quiz_questions` — quiz_id, prompt, options (json), correct_index
- `quiz_attempts` — user_id, quiz_id, score, passed, attempted_at

RLS summary:
- Students: read published course content only for courses they are enrolled in; read/write only their own progress, enrollments, and quiz attempts
- Admins (`has_role`): full read/write on authoring tables
- Certificate issuing on completion runs through an edge function with the service role (no client-side issuing), consistent with your current setup

## New routes

- `/learn` — student dashboard ("My Learning")
- `/learn/:courseSlug` — course overview + curriculum
- `/learn/:courseSlug/:lessonId` — lesson player
- `/account` — student profile/settings
- Admin authoring lives under the existing `/admin` (new tabs: Courses, Lessons, Quizzes)
- Student auth gets its own page/flow so it doesn't redirect to `/admin` like the current `Auth.tsx`

## How it reuses what you already have

- Auth + `user_roles` + RLS patterns — already in place
- Certificates + QR verification + `issue-certificate` edge function — wired to fire on completion
- Assessment/quiz UI patterns from the scorecard
- Built-in payments (Stripe/Paddle) for paid access — enabled when you're ready to sell
- Existing branding/design system (cobalt-on-navy) across all new screens

## Build order (incremental, shippable steps)

1. Data model + RLS + GRANTs (migration)
2. Admin authoring: create courses/modules/lessons
3. Student auth + `/learn` dashboard + enrolment (free/manual first)
4. Lesson player + progress tracking
5. Quizzes + scoring
6. Auto-certificate on completion
7. Payments gating (enable when ready to charge)

## Technical notes

- Video is embedded from a video host, never stored as raw files in the database — keeps it fast and cheap.
- Completion → certificate runs server-side via an edge function to keep issuing tamper-proof.
- Drip is computed from `enrolled_at + drip_days`, enforced in RLS/queries so locked lessons can't be fetched early.
- This is a multi-step build; each step above is independently testable so you can validate as we go rather than one big drop.

Once you approve, I'll start with Step 1 (data model) and Step 2 (admin authoring) so you can create a real course and see it end-to-end.