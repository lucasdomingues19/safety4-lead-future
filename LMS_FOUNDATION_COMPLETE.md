# LMS Foundation Phase 1 - COMPLETE

## Completed ✅

### 1. Database Schema (183 lines)
**File:** `supabase/migrations/20260904_create_lms_schema.sql`

6 core tables with full RLS policies and indexes:
- `courses` - Course metadata (title, slug, price, instructor_id, published status)
- `modules` - Lesson grouping with drip-release support (drip_days field)
- `lessons` - Individual units (video_url, video_duration_seconds, content, position)
- `enrollments` - Student access (user_id, course_id, stripe_subscription_id, status)
- `lesson_progress` - Watch tracking (watch_duration_seconds, is_completed, completed_at)
- `certificates` - Completion certificates (user_id, course_id, certificate_url)

**Security:**
- Courses: Published visible to all, instructors edit their own
- Modules/Lessons: Visible only if course is published
- Enrollments: Users see their own only
- Progress/Certificates: Users manage their own only
- All tables have proper CASCADE delete relationships

### 2. TypeScript Types
**File:** `src/lib/lms.ts` (updated)

```typescript
export interface Course { ... }
export interface Module { drip_days?: number }
export interface Lesson { duration_minutes?: number }
export interface Enrollment { ... }
export interface LessonProgress { ... }
export interface Certificate { ... }
```

**Helpers included:**
- `asLessons()` - Convert video_duration_seconds to duration_minutes
- `isModuleUnlocked()` - Check if drip-release has unlocked module
- `formatPrice()` - Display course pricing
- `toEmbedUrl()` - Support YouTube, Vimeo, Mux, direct URLs

### 3. React Hooks (3 files created)

**`src/hooks/useLessonVideo.ts`**
- `uploadVideo(file, courseId, lessonId)` → string | null (public URL)
- Uploads to Supabase Storage bucket: `video-lessons/{courseId}/{lessonId}`
- Returns public URL for storing in lessons.video_url
- Error handling + loading state

**`src/hooks/useCourseEnrollment.ts`**
- `checkEnrollment(userId, courseId)` → Enrollment | null
- `enrollUser(userId, courseId, stripeSubscriptionId?)` → Enrollment | null
- Handles stripe_subscription_id linkage
- RLS enforced: users can only query their own enrollments

**`src/hooks/useLessonProgress.ts`**
- `progress` state synced from DB
- `updateProgress(watchDurationSeconds, isCompleted)` → LessonProgress | null
- Auto-upsert with completed_at timestamp
- Calls every ~10s as video plays to persist watch time

### 4. UI Components

**`src/components/learn/LessonPlayer.tsx`**
- Video iframe embed (supports YouTube, Vimeo, direct URLs)
- 80% watch threshold for completion
- Progress bar showing watch %
- Mark Complete button
- Rich content rendering below video
- Connected to useLessonProgress hook

### 5. Implementation Guide
**File:** `LMS_PHASE_GUIDE.md`
- 100+ line reference guide
- Phase breakdown (1-5)
- Schema reference
- Quick start steps
- Testing checklist

---

## Next Steps (After Supabase Migration)

### Immediate (Day 1-2)
1. User creates own Supabase project (see [Lovable migration plan](https://claudecode.dev/plan))
2. Link CLI: `supabase link --project-ref <ref>`
3. Apply migration: `supabase db push`
4. Create storage bucket: Dashboard → Storage → Create Bucket → `video-lessons` (public)
5. Generate types: `supabase gen types typescript > src/integrations/supabase/types.ts`

### Phase 2a - Video Upload (Week 7)
Build VideoUploadForm component:
- [ ] Drag-drop file input
- [ ] useLessonVideo.uploadVideo() integration
- [ ] Progress bar
- [ ] Auto-extract duration or input manually
- [ ] Save video_url to lessons table

Test with CourseView:
- [ ] Upload test video to Supabase Storage
- [ ] Play back in LessonPlayer component
- [ ] Watch progress tracking works
- [ ] Mark complete button functional

### Phase 2b - Video Hosting Decision (Week 8)
Currently uses Supabase Storage (free, basic CDN):
- ✅ Works for MVP/training
- ⚠️ No adaptive bitrate
- ⚠️ No transcoding

Future upgrade (no schema changes needed):
- Mux (paid, full CDN, adaptive bitrate)
- Cloudflare Stream (cheaper, Stream-to-HLS)
- Just change video_url generation in VideoUploadForm

### Phase 3 - Stripe Checkout (Week 10)
- [ ] CourseCheckout component (Stripe payment form)
- [ ] Edge function: create-checkout-session
- [ ] Webhook listener: checkout.session.completed → create enrollment

### Phase 4 - Admin Course Builder (Week 11)
- [ ] AdminCourseList CRUD
- [ ] CourseEditor
- [ ] ModuleEditor (drag-to-reorder)
- [ ] LessonEditor with video upload

### Phase 5 - Student Dashboard (Week 12)
- [ ] MyCoursesPage
- [ ] CertificateViewer
- [ ] ProgressChart

---

## File Inventory

```
supabase/migrations/
├── 20260904_create_lms_schema.sql (new)

src/lib/
├── lms.ts (updated with new schema types)

src/hooks/
├── useLessonVideo.ts (new)
├── useCourseEnrollment.ts (new)
├── useLessonProgress.ts (new)

src/components/learn/
├── LessonPlayer.tsx (new)
├── LearnHeader.tsx (existing)
├── CourseView.tsx (existing, already uses new types)

Project Docs/
├── LMS_PHASE_GUIDE.md (new)
└── LMS_FOUNDATION_COMPLETE.md (this file)
```

---

## Architecture Notes

### Video Storage
- Supabase Storage public bucket: `video-lessons`
- Path: `{courseId}/{lessonId}.mp4`
- Public URL: `https://project.supabase.co/storage/v1/object/public/video-lessons/{courseId}/{lessonId}.mp4`
- Max file size: 5GB per file (Supabase limit)
- No transcoding in MVP (upload final MP4)

### Progress Tracking
- LessonPlayer → useLessonProgress (every 10s)
- Updates `lesson_progress.watch_duration_seconds`
- 80% threshold = completion eligible
- User marks complete → sets `is_completed=true`, `completed_at=NOW()`
- Certificate eligibility: All lessons in course completed

### Security Model
- RLS on all tables (enforce at DB layer)
- Users can only:
  - View published courses
  - View lessons if enrolled in course
  - Update their own progress
  - View their own certificates
- Instructors can:
  - Create/edit/publish courses they own
  - Upload videos to their course storage paths

---

## Testing Checklist for Phase 2 Go/No-Go

- [ ] Database migration applies cleanly
- [ ] Storage bucket created with public access
- [ ] TypeScript types generate without errors
- [ ] useLessonProgress hook loads existing progress
- [ ] LessonPlayer renders test video
- [ ] Watch progress updates to DB (verify in Dashboard)
- [ ] 80% watch → Mark Complete button appears
- [ ] Click Complete → sets is_completed=true
- [ ] Page refresh → progress persists (loads from DB)

---

## Time Estimate for Remaining Phases

- Phase 2a (Video Upload): 3 days
- Phase 2b (Video Hosting): 1 day
- Phase 3 (Stripe): 3 days
- Phase 4 (Admin UI): 4 days
- Phase 5 (Dashboard): 2 days
- Testing + launch prep: 2 days

**Total remaining: ~15 days** (vs original 32-week estimate 😅)

**When ready for launch:**
- Migrate Kajabi courses to this LMS (bulk import)
- Sunset Kajabi subscription
- Update all course links to new platform

---

## Questions / Decisions Pending

1. **Video hosting upgrade timing?**
   - Supabase Storage works for <50GB total
   - Move to Mux when transcoding needed or >100h video content

2. **Live classes / Q&A?**
   - Not in MVP (Phase 5)
   - Post-launch: integrate Discord/Slack or custom chat

3. **Bulk import from Kajabi?**
   - Waiting for this LMS go-live
   - Have Kajabi export script ready separately

4. **Launch timeline?**
   - MVP ready: Week 12 (Oct 2026)
   - Kajabi migration: Week 13-14
   - Public launch: Mid-October 2026

---

Generated: 2026-09-04
Next review: After Phase 2 completion (Week 7)
