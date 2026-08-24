import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { formatPrice, type Course } from "@/lib/lms";

interface CourseWithProgress extends Course {
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  enrolled: boolean;
}

const LearnDashboard = () => {
  const { user, loading: authLoading } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([]);
  const [catalogue, setCatalogue] = useState<Course[]>([]);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/learn/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: courses }, { data: enrollments }, { data: progress }] = await Promise.all([
        supabase.from("courses").select("*").eq("published", true).order("created_at"),
        supabase.from("enrollments").select("*").eq("user_id", user.id),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
      ]);

      const enrolledIds = new Set((enrollments ?? []).map((e) => e.course_id));
      const completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));

      // For enrolled courses, count lessons to compute progress.
      const enrolled: CourseWithProgress[] = [];
      const remaining: Course[] = [];

      for (const course of (courses ?? []) as Course[]) {
        if (!enrolledIds.has(course.id)) {
          remaining.push(course);
          continue;
        }
        const { data: lessonRows } = await supabase
          .from("lessons")
          .select("id, modules!inner(course_id)")
          .eq("modules.course_id", course.id);
        const total = lessonRows?.length ?? 0;
        const completed = (lessonRows ?? []).filter((l) => completedLessonIds.has(l.id)).length;
        enrolled.push({
          ...course,
          totalLessons: total,
          completedLessons: completed,
          progressPercent: total ? Math.round((completed / total) * 100) : 0,
          enrolled: true,
        });
      }

      setEnrolledCourses(enrolled);
      setCatalogue(remaining);
    } catch (err) {
      console.error(err);
      toast.error("Could not load your courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course: Course) => {
    if (!user) return;
    setEnrollingId(course.id);
    try {
      const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: course.id,
      });
      if (error) throw error;
      toast.success(`Enrolled in ${course.title}`);
      navigate(`/learn/${course.slug}`);
    } catch (err) {
      console.error(err);
      toast.error("Enrolment failed");
    } finally {
      setEnrollingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LearnHeader email={user?.email} />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <p className="mb-2 inline-block rounded-md bg-primary px-2.5 py-1 font-mono text-xs uppercase tracking-[0.25em] text-primary-foreground">
            My Learning
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Welcome back
          </h1>
        </div>

        {/* Enrolled courses */}
        {enrolledCourses.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-white">
              <GraduationCap className="h-5 w-5 text-primary" /> Your courses
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="flex flex-col overflow-hidden border-white/10 bg-card">
                  {course.cover_image_url && (
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      loading="lazy"
                      decoding="async"
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg text-white">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4">
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-white/60">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        <span>{course.progressPercent}%</span>
                      </div>
                      <Progress value={course.progressPercent} className="h-2" />
                    </div>
                    <Button className="w-full" onClick={() => navigate(`/learn/${course.slug}`)}>
                      {course.progressPercent === 100
                        ? "Review course"
                        : course.progressPercent === 0
                        ? "Start course"
                        : "Continue"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Catalogue */}
        <section>
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-white">
            <BookOpen className="h-5 w-5 text-primary" /> Course catalogue
          </h2>
          {catalogue.length === 0 ? (
            <p className="text-white/60">
              {enrolledCourses.length > 0
                ? "You're enrolled in every available course. 🎉"
                : "No courses available yet. Check back soon."}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {catalogue.map((course) => (
                <Card key={course.id} className="flex flex-col overflow-hidden border-white/10 bg-card">
                  {course.cover_image_url && (
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      loading="lazy"
                      decoding="async"
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary">{formatPrice(course.price_cents, course.currency)}</Badge>
                      {course.cpd_hours ? (
                        <Badge variant="outline" className="text-white/70">{course.cpd_hours} CPD hrs</Badge>
                      ) : null}
                    </div>
                    <CardTitle className="text-lg text-white">{course.title}</CardTitle>
                    {course.description && (
                      <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button
                      className="w-full"
                      variant={course.price_cents > 0 ? "outline" : "default"}
                      onClick={() => handleEnroll(course)}
                      disabled={enrollingId === course.id}
                    >
                      {enrollingId === course.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {course.price_cents > 0 ? "Enrol" : "Enrol for free"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default LearnDashboard;
