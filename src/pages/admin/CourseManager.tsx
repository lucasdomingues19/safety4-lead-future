import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { CoursesHome } from "@/components/admin/course-builder/CoursesHome";
import { CourseBuilder } from "@/components/admin/course-builder/CourseBuilder";

// /admin/courses            -> course cards
// /admin/courses/:courseId  -> outline + editor (Kajabi-style builder)
const CourseManager = () => {
  const { courseId } = useParams();
  const { checking, isAdmin } = useAdminGuard();

  if (checking || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <Loader2 className="h-7 w-7 animate-spin text-[#3434ff]" />
      </div>
    );
  }
  return courseId ? <CourseBuilder key={courseId} courseId={courseId} /> : <CoursesHome />;
};

export default CourseManager;
