import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserEnrolledCourses } from "@/lib/enrollment";
import { formatPrice, type Course } from "@/lib/lms";
import { Loader2, BookOpen, Award, Clock, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";

interface CourseProgress {
  course: Course & { enrolled_at: string };
  progress: number; // 0-100
  modulesCompleted: number;
  totalModules: number;
  certificateEarned?: boolean;
}

export function StudentDashboard({ userId }: { userId: string }) {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCourses();
  }, [userId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const enrolledCourses = await getUserEnrolledCourses(userId);

      // For each course, fetch progress
      const coursesWithProgress: CourseProgress[] = enrolledCourses.map((course) => ({
        course,
        progress: Math.floor(Math.random() * 100), // TODO: Calculate real progress
        modulesCompleted: Math.floor(Math.random() * 5),
        totalModules: 5,
        certificateEarned: Math.random() > 0.5, // TODO: Check actual certificate status
      }));

      setCourses(coursesWithProgress);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((item) =>
    item.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#3434ff]" />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 28px",
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "#8ab815",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          My Learning
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#0b0b2c", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ marginTop: "12px", fontSize: "16px", color: "#69697b", lineHeight: 1.6 }}>
          Continue your learning journey. You have {courses.length} active course{courses.length === 1 ? "" : "s"}.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        <StatCard
          icon={<BookOpen size={20} />}
          label="Courses Enrolled"
          value={courses.length}
          color="#3434ff"
        />
        <StatCard
          icon={<Award size={20} />}
          label="Certificates Earned"
          value={courses.filter((c) => c.certificateEarned).length}
          color="#8ab815"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Total Learning Hours"
          value={Math.round(courses.reduce((sum) => sum + Math.random() * 40, 0))}
          color="#a6e21a"
        />
      </div>

      {/* Search */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              color: "#cbd5e1",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "12px 14px 12px 40px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#f8fafc",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
          }}
        >
          <BookOpen size={48} style={{ margin: "0 auto 16px", color: "#cbd5e1" }} />
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#0b0b2c", marginBottom: "8px" }}>
            {searchTerm ? "No courses found" : "No enrolled courses yet"}
          </div>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>
            {searchTerm ? "Try a different search term" : "Explore our course catalog to get started"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredCourses.map((item) => (
            <CourseCard key={item.course.id} courseProgress={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flex: "none",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "#0b0b2c", marginTop: "4px" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ courseProgress }: { courseProgress: CourseProgress }) {
  const { course, progress, modulesCompleted, totalModules, certificateEarned } = courseProgress;

  const handleContinue = () => {
    window.location.href = `/learn/${course.slug}/lesson/1`;
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(11,11,44,0.12)";
        e.currentTarget.style.borderColor = "#cbd5e1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e2e8f0";
      }}
    >
      {/* Image */}
      {course.cover_image_url && (
        <div
          style={{
            width: "100%",
            height: "160px",
            background: `url(${course.cover_image_url}) center / cover`,
            borderBottom: "1px solid #e2e8f0",
          }}
        />
      )}

      {/* Content */}
      <div style={{ padding: "20px" }}>
        {/* Title */}
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c", margin: 0, marginBottom: "8px" }}>
          {course.title}
        </h3>

        {/* Progress */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>Progress</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0b0b2c" }}>{progress}%</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "999px",
              background: "#e2e8f0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#3434ff",
                borderRadius: "999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", fontSize: "12px", color: "#69697b" }}>
          <span>
            {modulesCompleted}/{totalModules} modules
          </span>
          {certificateEarned && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8ab815", fontWeight: 600 }}>
              <Award size={12} /> Certificate
            </span>
          )}
        </div>

        {/* Action */}
        <button
          onClick={handleContinue}
          style={{
            width: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            background: "#f8fafc",
            color: "#0b0b2c",
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: 700,
            padding: "10px 12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3434ff";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#3434ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.color = "#0b0b2c";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          Continue learning <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
