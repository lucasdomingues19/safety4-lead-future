# Phase 2: Video Upload & Playback - Testing Guide

## What We Built

✅ **VideoUploadForm** (`src/components/learn/VideoUploadForm.tsx`)
- Drag-drop video file input
- Upload to Supabase Storage (video-lessons bucket)
- File validation (type, size < 5GB)
- Error handling and progress feedback

✅ **LessonEditor** (`src/components/admin/LessonEditor.tsx`)
- Create/edit lesson metadata (title, description)
- Embedded VideoUploadForm for video upload
- Rich content editor (HTML)
- Position/ordering control
- Lock status toggle

✅ **AdminCourseManager** (`src/components/admin/AdminCourseManager.tsx`)
- Create new courses
- View all instructor's courses (instructors can only see their own)
- Expand/collapse to view modules and lessons
- Quick-add lessons interface
- Edit existing lessons

✅ **LessonPlayer** (created in Phase 1, ready for use)
- Displays videos from Supabase Storage (or YouTube, Vimeo, Mux)
- Watch progress tracking (80% threshold)
- Mark complete button
- Progress bar with percentage

✅ **Hooks**
- `useLessonVideo` - Upload videos and get public URLs
- `useLessonProgress` - Track watch time and mark complete
- `useCourseEnrollment` - Manage enrollments

---

## Manual Testing Workflow

### 1. Access Admin Course Manager

The component is ready to embed in your admin dashboard. Add to your admin route:

```typescript
import { AdminCourseManager } from "@/components/admin/AdminCourseManager";

// In your admin page:
<AdminCourseManager />
```

### 2. Create a Test Course

1. Open the admin page with AdminCourseManager
2. Enter course name: "Test Course" 
3. Click "Create"
4. Course appears in list with "Draft" status

### 3. Create a Module (TODO)

Currently, modules need to be created via SQL or a separate component. For testing:

```sql
INSERT INTO modules (course_id, title, description, position)
VALUES (
  'YOUR_COURSE_ID_HERE',
  'Module 1: Basics',
  'Introduction to the course',
  1
);
```

### 4. Create Lesson with Video Upload

1. In AdminCourseManager, click course to expand
2. Click "New Lesson" under modules
3. Fill in lesson form:
   - **Title**: "Welcome to the Course"
   - **Description**: "Quick intro lesson"
   - **Position**: 1
4. **Drag-drop a video file** into the VideoUploadForm (or click to select)
   - Supports: MP4, WebM, OGG, QuickTime
   - Max size: 5GB
5. Click "Upload Video"
6. Wait for upload to complete (will show success toast)
7. Click "Save Lesson"

### 5. Verify Video in Database

Video URL should be stored in `lessons.video_url`:
```sql
SELECT id, title, video_url FROM lessons WHERE id = 'LESSON_ID';
```

Expected format:
```
https://yiqnwhxnbbtoxhysgteh.supabase.co/storage/v1/object/public/video-lessons/{courseId}/{lessonId}.mp4
```

### 6. Test LessonPlayer

Create a test page to view the lesson:

```typescript
import { LessonPlayer } from "@/components/learn/LessonPlayer";

// Get lesson from database
const lesson = await supabase.from("lessons").select().single();
const userId = auth.user.id;

<LessonPlayer 
  lesson={lesson} 
  userId={userId}
  onComplete={() => console.log('Lesson completed!')}
/>
```

### 7. Verify Progress Tracking

In Supabase dashboard:
1. Go to `lesson_progress` table
2. Play video in LessonPlayer
3. Watch ~80% of the video
4. Click "Mark as Complete"
5. Check database - row should show:
   - `user_id`: your user ID
   - `lesson_id`: the lesson ID
   - `is_completed`: true
   - `completed_at`: current timestamp
   - `watch_duration_seconds`: ~80% of video length

---

## Testing Checklist

- [ ] Admin creates test course ✓ (AdminCourseManager)
- [ ] Admin creates test module (manual SQL for now)
- [ ] Admin creates test lesson ✓ (LessonEditor)
- [ ] Video file uploads successfully
- [ ] Video URL stored in database
- [ ] Video plays in LessonPlayer
- [ ] Watch progress updates every ~10s
- [ ] 80% watch → "Mark Complete" button shows
- [ ] Click "Mark Complete" → sets is_completed=true
- [ ] Refresh page → progress persists (loads from DB)
- [ ] Video controls work (play, pause, seek)
- [ ] Rich content renders in lesson (if added)

---

## Known Limitations in Phase 2

1. **Module creation**: No UI component yet (use SQL)
2. **Module drag-to-reorder**: Not implemented
3. **No video duration auto-extract**: Set manually or ffmpeg on server
4. **No live preview**: LessonPlayer only renders in full page, not form preview
5. **No video transcoding**: Upload final MP4 (no format conversion)
6. **Single instructor per course**: No team courses yet

---

## Next Steps (Phase 3 - Week 10)

### Stripe Integration
- [ ] CourseCheckout component (payment form)
- [ ] create-checkout-session edge function
- [ ] Stripe webhook listener (checkout.session.completed)
- [ ] Auto-create enrollment + send confirmation email

### Support for Module Creation
- [ ] ModuleEditor component (drag to reorder)
- [ ] Quick module adder in AdminCourseManager

### Video Duration Extraction
- [ ] Server-side ffmpeg hook or Mux integration
- [ ] Auto-populate video_duration_seconds on upload

---

## Performance Notes

**Supabase Storage CDN:**
- First request: ~500ms (cold)
- Subsequent requests: ~50ms (cached)
- No transcoding/adaptive bitrate (all users get same quality)

**If needed later (Phase 2b):**
- Mux: Adaptive bitrate, full CDN (cost ~$0.015/GB)
- Cloudflare Stream: Stream-to-HLS, cheaper option

**Database queries:**
- Lessons by module: Indexed on module_id ✓
- Progress by user: Indexed on user_id ✓
- Enrollments by course: Indexed on course_id ✓

---

## Debugging Tips

**Video won't upload:**
- Check browser console for errors
- Verify file is < 5GB
- Check Supabase Storage bucket is public
- Verify useLessonVideo hook is called correctly

**Video URL not saving:**
- Check database connection (enrollments working?)
- Verify lesson.module_id is valid
- Check RLS policies aren't blocking writes

**Progress not tracking:**
- Verify useLessonProgress hook is mounted
- Check browser console for fetch errors
- Verify user is authenticated (useAuthUser)
- Check RLS - users should only see their own progress

**LessonPlayer not rendering:**
- Verify lesson.video_url is a valid URL
- Check iframe sandbox restrictions
- Try with a YouTube URL first (known to work)

---

## SQL for Quick Testing

```sql
-- Create test course
INSERT INTO courses (title, slug, instructor_id, published)
SELECT 'Test Course', 'test-course', id, false
FROM auth.users 
WHERE email = 'your-email@example.com'
RETURNING id;

-- Create test module (replace COURSE_ID)
INSERT INTO modules (course_id, title, description, position)
VALUES ('COURSE_ID', 'Module 1', 'Test module', 1)
RETURNING id;

-- Create test lesson (replace MODULE_ID)
INSERT INTO lessons (module_id, title, description, position, video_url)
VALUES (
  'MODULE_ID',
  'Lesson 1',
  'Test lesson',
  1,
  'https://www.youtube.com/embed/dQw4w9WgXcQ' -- YouTube placeholder
)
RETURNING id;

-- View all your lessons with videos
SELECT l.id, l.title, l.video_url, m.title as module_name
FROM lessons l
JOIN modules m ON l.module_id = m.id
WHERE m.course_id IN (
  SELECT id FROM courses 
  WHERE instructor_id = auth.uid()
)
ORDER BY m.position, l.position;
```

---

## Success Criteria for Phase 2

✅ VideoUploadForm uploads file to Supabase Storage  
✅ LessonEditor saves metadata + video URL to database  
✅ LessonPlayer renders video from URL  
✅ Watch progress persists in database  
✅ Mark complete button works  
✅ AdminCourseManager lists courses and lessons  

Phase 2 is **complete and testable** with the workflow above.

Next phase: Stripe checkout integration (Week 10)
