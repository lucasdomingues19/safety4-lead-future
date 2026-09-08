import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Course, Module, Lesson } from "@/lib/lms";
import { LessonEditor } from "./LessonEditor";

export const AdminCourseManager = () => {
  const { user } = useAuthUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Record<string, Module[]>>({});
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<{
    courseId: string;
    moduleId: string;
    lessonId?: string;
  } | null>(null);
  const [newCourseName, setNewCourseName] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load courses
      const { data: coursesData, error: coursesErr } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", user.id);

      if (coursesErr) throw coursesErr;
      setCourses(coursesData as Course[]);

      // Load all modules
      if (coursesData && coursesData.length > 0) {
        const courseIds = coursesData.map((c) => c.id);
        const { data: modulesData, error: modulesErr } = await supabase
          .from("modules")
          .select("*")
          .in("course_id", courseIds)
          .order("position");

        if (modulesErr) throw modulesErr;

        const modulesByCourse: Record<string, Module[]> = {};
        coursesData.forEach((c) => {
          modulesByCourse[c.id] = (modulesData as Module[]).filter(
            (m) => m.course_id === c.id
          );
        });
        setModules(modulesByCourse);

        // Load all lessons
        const moduleIds = (modulesData as Module[]).map((m) => m.id);
        if (moduleIds.length > 0) {
          const { data: lessonsData, error: lessonsErr } = await supabase
            .from("lessons")
            .select("*")
            .in("module_id", moduleIds)
            .order("position");

          if (lessonsErr) throw lessonsErr;

          const lessonsByModule: Record<string, Lesson[]> = {};
          (modulesData as Module[]).forEach((m) => {
            lessonsByModule[m.id] = (lessonsData as Lesson[]).filter(
              (l) => l.module_id === m.id
            );
          });
          setLessons(lessonsByModule);
        }
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async () => {
    if (!user || !newCourseName.trim()) {
      toast.error("Course name required");
      return;
    }

    setCreatingCourse(true);

    try {
      const slug = newCourseName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const { data, error } = await supabase
        .from("courses")
        .insert([
          {
            title: newCourseName,
            slug: slug,
            instructor_id: user.id,
            published: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCourses([...courses, data as Course]);
      setNewCourseName("");
      toast.success("Course created!");
    } catch (err) {
      console.error("Error creating course:", err);
      toast.error("Failed to create course");
    } finally {
      setCreatingCourse(false);
    }
  };

  const toggleCourseExpand = (courseId: string) => {
    const newSet = new Set(expandedCourses);
    if (newSet.has(courseId)) {
      newSet.delete(courseId);
    } else {
      newSet.add(courseId);
    }
    setExpandedCourses(newSet);
  };

  const toggleModuleExpand = (moduleId: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId);
    } else {
      newSet.add(moduleId);
    }
    setExpandedModules(newSet);
  };

  if (editingLesson) {
    return (
      <div className="max-w-4xl">
        <LessonEditor
          courseId={editingLesson.courseId}
          moduleId={editingLesson.moduleId}
          lessonId={editingLesson.lessonId}
          onSave={() => {
            setEditingLesson(null);
            loadCourses();
          }}
          onCancel={() => setEditingLesson(null)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Create Course */}
      <div className="rounded-lg bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Create New Course</h2>
        <div className="flex gap-2">
          <Input
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            placeholder="Course title"
            className="flex-1 bg-white/5 border-white/10 text-white"
          />
          <Button
            onClick={createCourse}
            disabled={creatingCourse || !newCourseName.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {courses.length === 0 ? (
          <p className="text-center py-8 text-white/60">No courses yet. Create one above!</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              {/* Course Header */}
              <button
                onClick={() => toggleCourseExpand(course.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  {expandedCourses.has(course.id) ? (
                    <ChevronUp className="h-5 w-5 text-white/60" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-white/60" />
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{course.title}</h3>
                    <p className="text-xs text-white/40">{course.slug}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  course.published ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"
                }`}>
                  {course.published ? "Published" : "Draft"}
                </span>
              </button>

              {/* Course Content */}
              {expandedCourses.has(course.id) && (
                <div className="border-t border-white/10 px-6 py-4 space-y-4 bg-white/[0.02]">
                  {/* Modules */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Modules</h4>
                    <div className="space-y-1">
                      {(modules[course.id] || []).map((module) => (
                        <div key={module.id} className="rounded bg-white/10 overflow-hidden">
                          <button
                            onClick={() => toggleModuleExpand(module.id)}
                            className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 text-left"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {expandedModules.has(module.id) ? (
                                <ChevronUp className="h-4 w-4 text-white/60" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-white/60" />
                              )}
                              <span className="text-sm text-white">{module.title}</span>
                            </div>
                            <span className="text-xs text-white/40">
                              {(lessons[module.id] || []).length} lessons
                            </span>
                          </button>

                          {/* Lessons */}
                          {expandedModules.has(module.id) && (
                            <div className="border-t border-white/10 px-4 py-2 space-y-1 bg-white/5">
                              {(lessons[module.id] || []).map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between py-2 px-2 rounded hover:bg-white/5 text-sm"
                                >
                                  <span className="text-white/80">{lesson.title}</span>
                                  <button
                                    onClick={() =>
                                      setEditingLesson({
                                        courseId: course.id,
                                        moduleId: module.id,
                                        lessonId: lesson.id,
                                      })
                                    }
                                    className="text-primary hover:text-primary/80"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() =>
                                  setEditingLesson({
                                    courseId: course.id,
                                    moduleId: module.id,
                                  })
                                }
                                className="w-full py-2 text-xs text-primary hover:text-primary/80 flex items-center justify-center gap-1"
                              >
                                <Plus className="h-3 w-3" /> New Lesson
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
