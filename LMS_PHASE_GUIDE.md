# LMS Phase Implementation Guide

## Phase 1: Foundations ✅ (IN PROGRESS)

### Schema & Database
- [x] Created LMS database schema (`supabase/migrations/20260904_create_lms_schema.sql`)
  - 6 core tables: courses, modules, lessons, enrollments, lesson_progress, certificates
  - Full RLS policies for security
  - Performance indexes on foreign keys
- [ ] **TODO**: Apply migration to production Supabase project
  - Requires: User creates own Supabase project (see [Lovable-to-Supabase migration plan](https://claudecode.dev/plan))
  - Command: `supabase db push`

### TypeScript Types
- [x] Updated `src/lib/lms.ts` with new schema types
  - Course, Module, Lesson, Enrollment, LessonProgress, Certificate
  - Helper: `asLessons()` - converts video_duration_seconds to duration_minutes
  - Helper: `isModuleUnlocked()` - checks drip-release dates
  - Helper: `formatPrice()` - formats course prices

### Storage
- [x] Designed video storage bucket structure
  - Bucket name: `video-lessons` (public read access)
  - Path structure: `{courseId}/{lessonId}.mp4`
  - Max file size: 5GB (supports most video formats)
- [ ] **TODO**: Create bucket in Supabase
  - Via Dashboard: Storage → Create Bucket → `video-lessons` (public)

### React Hooks
- [x] Created `src/hooks/useLessonVideo.ts` - Video upload to Supabase Storage
- [x] Created `src/hooks/useCourseEnrollment.ts` - Check/create enrollments
- [x] Created `src/hooks/useLessonProgress.ts` - Track watch time & completion

### UI Components
- [x] Created `src/components/learn/LessonPlayer.tsx` (skeleton)
  - Video iframe embed (supports YouTube, Vimeo, Mux, direct URLs)
  - Watch progress tracking (80% = completion threshold)
  - Mark complete button
  - Rich content rendering

---

## Phase 2: Video Upload & Playback (Weeks 7-9)

### Lesson Player Enhancement
```
Tasks:
- [ ] Connect LessonPlayer to useLessonProgress hook
- [ ] Add video seek tracking (update watch_duration_seconds every 10s)
- [ ] Add caption/subtitle support
- [ ] Add playback speed controls
- [ ] Persist watch position on page refresh
```

### Video Upload Handler
```
Components Needed:
- [ ] VideoUploadForm (admin component)
  - Drag-drop video file input
  - Progress bar
  - Duration extraction (ffmpeg.wasm or server-side)
  - POST to useLessonVideo hook
  - Validate: MP4 < 5GB, auto-reject oversized

- [ ] LessonContentEditor (admin component)
  - Video URL input (YouTube, Vimeo, Supabase Storage)
  - Rich text editor for lesson.content
  - Auto-calculate video duration
  - Save to lessons table
```

### Video Hosting Options
**Phase 2a (MVP - Week 7):**
- Supabase Storage (free, 5GB limit per file, no CDN optimization)
- Works for: training videos, internal courses
- URL format: `https://{project}.supabase.co/storage/v1/object/public/video-lessons/{courseId}/{lessonId}.mp4`

**Phase 2b (Future - Week 8, if needed):**
- Mux integration (paid, but CDN + adaptive bitrate)
- Cloudflare Stream (cheaper, Stream-to-HLS pipeline)
- Swap implementation without schema changes (just change video_url generation)

---

## Phase 3: Stripe Integration (Week 10)

### Enrollment Checkout
```
Components Needed:
- [ ] CourseCheckout (public component)
  - Display course.price
  - Stripe payment button (via @stripe/react-js)
  - POST /api/create-checkout-session
  
- [ ] StripeWebhookListener (edge function)
  - Listen: checkout.session.completed
  - Create enrollment + stripe_subscription_id
  - Send confirmation email
```

### Admin Dashboard
```
- [ ] ViewEnrollments (admin component)
  - Filter by course
  - Show user email, enrollment date, expires_at
  - Manual refund button (sets status='cancelled')
```

---

## Phase 4: Admin Course Builder (Week 11)

### Components
- [ ] AdminCourseList - CRUD courses
- [ ] CourseEditor - Edit title, description, price, published status
- [ ] ModuleEditor - Reorder modules (position field)
- [ ] LessonEditor - Add/edit/delete lessons, upload videos

### RLS Considerations
- Courses: Only instructors can edit/publish their own
- Students: See published courses + can view lessons if enrolled

---

## Phase 5: Student Dashboard (Week 12)

### Components
- [ ] MyCoursesPage - Show enrolled courses + progress
- [ ] CertificateViewer - Download/share certificates
- [ ] ProgressChart - Completion % by course

---

## Database Schema Reference

### courses
- `id` - UUID primary key
- `title`, `slug` - Course name & URL
- `description`, `price` - Details
- `instructor_id` - Owner (FK to auth.users)
- `published` - Course visibility
- `stripe_product_id` - For Stripe integration

### modules
- `course_id`, `position` - Grouping & order
- `drip_days` - Release schedule (future: 0 = available now, 7 = unlock after 7 days)

### lessons
- `module_id`, `position` - Grouping & order
- `video_url` - Supabase Storage / YouTube / Mux
- `video_duration_seconds` - Auto-extracted
- `content` - Rich text (HTML or Markdown)
- `is_locked` - For future certificate prerequisites

### enrollments
- `user_id`, `course_id` - Student → Course
- `stripe_subscription_id` - Link to Stripe sub
- `status` - 'active', 'cancelled', 'expired'
- `enrolled_at`, `expires_at` - Dates

### lesson_progress
- `user_id`, `lesson_id` - Student → Lesson
- `watch_duration_seconds` - How much they've watched
- `is_completed` - True if watched 80%+
- `completed_at` - When marked complete

### certificates
- `user_id`, `course_id` - Issued to student
- `certificate_url` - PDF or Syngraph link
- `issued_at` - When awarded

---

## Quick Start for Phase 2

### 1. Deploy LMS Database
```bash
# Link CLI to your Supabase project
supabase link --project-ref <your-project-id>

# Apply all migrations including LMS schema
supabase db push

# Verify tables exist
supabase db list
```

### 2. Create Video Bucket
```bash
# Via Supabase Dashboard:
# Storage → Create Bucket → Name: "video-lessons" → Make it public
```

### 3. Update TypeScript Types
```bash
# Generate types from your live database
supabase gen types typescript > src/integrations/supabase/types.ts
```

### 4. Test Hooks
```bash
# Load CourseView page with test course
# Verify:
# - Course loads from DB
# - Modules render correctly
# - Progress queries work
```

### 5. Build Lesson Editor
```
Next component to build: VideoUploadForm (src/components/learn/VideoUploadForm.tsx)
- [ ] File input (accept video/* files)
- [ ] Call useLessonVideo.uploadVideo()
- [ ] Show progress bar
- [ ] Update lesson record with video_url
```

---

## Environment Variables Needed

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for edge functions)
```

---

## Testing Checklist

- [ ] Create a test course with 2 modules, 3 lessons
- [ ] Upload a test video (5min MP4)
- [ ] Enroll a test user
- [ ] Watch 80% of the lesson
- [ ] Verify progress saves
- [ ] Download certificate

---

## Known Limitations (MVP)

- Single instructor per course (no team courses yet)
- No live classes or Q&A
- No drip-feed scheduling (drip_days field ready, not implemented)
- No prerequisites between lessons
- Supabase Storage CDN is basic (upgrade to Mux later if needed)
- No video transcoding (upload what you have)
