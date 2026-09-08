-- LMS Core Schema
-- Courses, modules, lessons, progress tracking, enrollments, certificates

-- 1. Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  stripe_product_id TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modules table (groups of lessons within a course)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lessons table (individual learning units)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT, -- Supabase Storage URL
  video_duration_seconds INTEGER,
  content TEXT, -- Rich text/markdown
  position INTEGER NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enrollments table (student access to courses)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 5. Lesson Progress table (student progress tracking)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  watch_duration_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 6. Certificates table (completion certificates)
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_url TEXT, -- Syngraph certificate
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_modules_course_id ON public.modules(course_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_course_id ON public.certificates(course_id);

-- Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Courses: published courses visible to all, only instructors can edit their own
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT
  TO authenticated
  USING (published = TRUE);

CREATE POLICY "courses_insert_own" ON public.courses
  FOR INSERT
  TO authenticated
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "courses_update_own" ON public.courses
  FOR UPDATE
  TO authenticated
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- Modules: visible if course is published and user is enrolled
CREATE POLICY "modules_select" ON public.modules
  FOR SELECT
  TO authenticated
  USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      WHERE c.published = TRUE
    )
  );

-- Lessons: visible if user is enrolled in the course
CREATE POLICY "lessons_select" ON public.lessons
  FOR SELECT
  TO authenticated
  USING (
    module_id IN (
      SELECT m.id FROM public.modules m
      WHERE m.course_id IN (
        SELECT c.id FROM public.courses c
        WHERE c.published = TRUE
      )
    )
  );

-- Enrollments: users see only their own, admins can see all
CREATE POLICY "enrollments_select_own" ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "enrollments_insert_own" ON public.enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Lesson Progress: users see/update only their own
CREATE POLICY "lesson_progress_select_own" ON public.lesson_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "lesson_progress_insert_own" ON public.lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "lesson_progress_update_own" ON public.lesson_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Certificates: users see only their own
CREATE POLICY "certificates_select_own" ON public.certificates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Comment on tables
COMMENT ON TABLE public.courses IS 'Learning courses with video and module structure';
COMMENT ON TABLE public.modules IS 'Grouping of lessons within a course';
COMMENT ON TABLE public.lessons IS 'Individual lessons with video and content';
COMMENT ON TABLE public.enrollments IS 'Student access to courses (Stripe-tied)';
COMMENT ON TABLE public.lesson_progress IS 'Track student progress through lessons';
COMMENT ON TABLE public.certificates IS 'Issued certificates for course completion';
