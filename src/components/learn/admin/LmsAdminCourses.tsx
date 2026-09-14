import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Eye, EyeOff, Save, X } from "lucide-react";
import { formatPrice, type Course } from "@/lib/lms";

interface CourseFormData {
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  cpd_hours: number;
  cover_image_url: string;
  published: boolean;
}

const defaultFormData: CourseFormData = {
  title: "",
  description: "",
  price_cents: 0,
  currency: "gbp",
  cpd_hours: 0,
  cover_image_url: "",
  published: false,
};

export function LmsAdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses((data as Course[]) || []);
      if (data && data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleNewCourse = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setFormOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description || "",
      price_cents: course.price_cents || 0,
      currency: course.currency || "gbp",
      cpd_hours: course.cpd_hours || 0,
      cover_image_url: course.cover_image_url || "",
      published: course.published || false,
    });
    setFormOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!formData.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update existing course
        const { error } = await supabase
          .from("courses")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Course updated");
      } else {
        // Create new course
        const { data, error } = await supabase
          .from("courses")
          .insert([formData])
          .select();

        if (error) throw error;
        if (data) {
          setCourses([data[0] as Course, ...courses]);
          setSelectedCourseId(data[0].id);
        }
        toast.success("Course created");
      }

      setFormOpen(false);
      await loadCourses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure? This will delete the course and all its data.")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);

      if (error) throw error;
      setCourses(courses.filter((c) => c.id !== courseId));
      if (selectedCourseId === courseId) {
        setSelectedCourseId(courses.length > 1 ? courses[0].id : null);
      }
      toast.success("Course deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete course");
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ published: !course.published })
        .eq("id", course.id);

      if (error) throw error;
      setCourses(
        courses.map((c) =>
          c.id === course.id ? { ...c, published: !c.published } : c,
        ),
      );
      toast.success(course.published ? "Course unpublished" : "Course published");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update course");
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Courses</h2>
          <Button onClick={handleNewCourse} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> New course
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className={`cursor-pointer border-2 transition-all ${
                selectedCourseId === course.id
                  ? "border-primary bg-primary/5"
                  : "border-white/10 hover:border-primary/50"
              }`}
              onClick={() => setSelectedCourseId(course.id)}
            >
              {course.cover_image_url && (
                <img
                  src={course.cover_image_url}
                  alt={course.title}
                  className="h-32 w-full object-cover"
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="line-clamp-2 text-base text-white">
                      {course.title}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      {course.price_cents > 0 ? (
                        <span className="text-sm font-medium text-primary">
                          {formatPrice(course.price_cents, course.currency)}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-green-400">Free</span>
                      )}
                      {course.published && (
                        <span className="text-xs font-semibold text-green-400">Published</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course);
                    }}
                    className="flex-1 gap-1 text-xs"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id);
                    }}
                    className="flex-1 gap-1 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card className="border-white/10 bg-card text-center">
            <CardContent className="py-20">
              <p className="text-white/60">No courses yet. Create one to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Details */}
      {selectedCourse && !formOpen && (
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{selectedCourse.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTogglePublish(selectedCourse)}
                  className="gap-2"
                >
                  {selectedCourse.published ? (
                    <>
                      <Eye className="h-4 w-4" /> Published
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" /> Draft
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditCourse(selectedCourse)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" /> Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCourse.description && (
              <div>
                <h4 className="text-sm font-semibold text-white/60">Description</h4>
                <p className="mt-1 text-white">{selectedCourse.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <h4 className="text-sm font-semibold text-white/60">Price</h4>
                <p className="mt-1 text-lg font-bold text-white">
                  {selectedCourse.price_cents > 0
                    ? formatPrice(selectedCourse.price_cents, selectedCourse.currency)
                    : "Free"}
                </p>
              </div>
              {selectedCourse.cpd_hours > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white/60">CPD Hours</h4>
                  <p className="mt-1 text-lg font-bold text-white">
                    {selectedCourse.cpd_hours}h
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-white/60">Status</h4>
                <p className="mt-1 text-lg font-bold text-white">
                  {selectedCourse.published ? "Published" : "Draft"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Form Modal */}
      {formOpen && (
        <Card className="border-primary bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-white">
              {editingId ? "Edit Course" : "Create New Course"}
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFormOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-white">Title *</label>
              <Input
                placeholder="Course title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white">Description</label>
              <textarea
                placeholder="Course description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:border-primary focus:outline-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-semibold text-white">Price (£)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.price_cents / 100}
                  onChange={(e) =>
                    setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value) * 100) })
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-primary focus:outline-none"
                >
                  <option value="gbp">GBP</option>
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-white">CPD Hours</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.cpd_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, cpd_hours: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary"
                  />
                  Published
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-white">Cover Image URL</label>
              <Input
                placeholder="https://..."
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                className="mt-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveCourse}
                disabled={saving}
                className="gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
