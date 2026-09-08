import { useState } from "react";
import { PlayCircle, Clock, CheckCircle2, Lock, Star, Share2, Award, BookOpen } from "lucide-react";

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<any>([
    {
      id: 1,
      title: "Introduction to AI-Powered EHS",
      instructor: "Lucas Domingues",
      progress: 45,
      lessons_completed: 3,
      total_lessons: 8,
      duration: "12 hours",
      status: "in_progress",
      image: null,
      rating: 4.8,
      enrolledDate: "2024-08-15",
    },
    {
      id: 2,
      title: "Advanced Safety Management",
      instructor: "Sarah Johnson",
      progress: 100,
      lessons_completed: 12,
      total_lessons: 12,
      duration: "8 hours",
      status: "completed",
      image: null,
      rating: 4.9,
      enrolledDate: "2024-07-20",
      certificateId: "CERT-2024-001",
    },
  ]);

  const [availableCourses] = useState([
    {
      id: 3,
      title: "Data Analytics for EHS",
      instructor: "Mike Chen",
      price: 49.99,
      students: 128,
      rating: 4.7,
      duration: "10 hours",
      image: null,
    },
    {
      id: 4,
      title: "AI Risk Assessment",
      instructor: "Emma Wilson",
      price: 59.99,
      students: 95,
      rating: 4.8,
      duration: "14 hours",
      image: null,
    },
  ]);

  const handleEnroll = (courseId: number) => {
    alert(`Enrolled in course ${courseId}`);
  };

  const inProgressCount = enrolledCourses.filter(c => c.status === "in_progress").length;
  const completedCount = enrolledCourses.filter(c => c.status === "completed").length;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        body, html { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* Accent bar */}
      <div className="fixed left-0 top-0 w-1 h-screen" style={{ backgroundColor: "#3434FF" }}></div>

      {/* Header */}
      <div className="bg-white px-8 py-12 ml-1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-3" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: "-0.5px" }}>
            My Learning
          </h1>
          <p className="mb-10 text-lg" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
            Continue your learning journey
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: "Enrolled Courses", value: enrolledCourses.length, icon: BookOpen, color: "#3434FF", bg: "rgba(52, 52, 255, 0.08)" },
              { label: "In Progress", value: inProgressCount, icon: PlayCircle, color: "#9EFF1F", bg: "rgba(158, 255, 31, 0.08)" },
              { label: "Completed", value: completedCount, icon: CheckCircle2, color: "#16a34a", bg: "rgba(22, 163, 74, 0.08)" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="rounded-2xl p-5 transition-all hover:shadow-lg" style={{ backgroundColor: stat.bg, borderLeft: `4px solid ${stat.color}` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: "0.5px" }}>
                        {stat.label}
                      </p>
                      <p className="text-4xl font-bold" style={{ color: stat.color, fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>
                        {stat.value}
                      </p>
                    </div>
                    <Icon className="w-10 h-10" style={{ color: stat.color, opacity: 0.15 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12 ml-1">
        {/* Enrolled Courses */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6" style={{ color: "#0B0B2C" }}>
            Your Courses
          </h2>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:translate-y-[-2px]"
                  style={{ backgroundColor: "#FAFAFA", border: "1px solid #ECECF4", borderLeft: "4px solid #3434FF" }}
                >
                  {/* Course Image */}
                  <div className="h-40" style={{ background: "linear-gradient(135deg, #3434FF15 0%, #F5F7FF 100%)" }}>
                    <BookOpen className="w-12 h-12 mx-auto mt-12" style={{ color: "#3434FF", opacity: 0.25 }} />
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                          {course.title}
                        </h3>
                        <p className="text-sm" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                          by {course.instructor}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-4 h-4 fill-yellow-400" style={{ color: "#f59e0b" }} />
                        <span className="text-sm font-bold" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                          {course.rating}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: "#F7F7FB" }}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>Progress</span>
                        <span className="font-bold" style={{ color: "#3434FF", fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#ECECF4" }}>
                        <div
                          className="h-full transition-all"
                          style={{
                            background: "linear-gradient(90deg, #3434FF 0%, #9EFF1F 100%)",
                            width: `${course.progress}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs mt-3" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                        {course.lessons_completed} of {course.total_lessons} lessons completed
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm mb-5" style={{ color: "#69697B" }}>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t" style={{ borderColor: "#ECECF4" }}>
                      <button
                        className="flex-1 py-2.5 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                        style={{ background: "#3434FF", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                      >
                        <PlayCircle className="w-4 h-4" />
                        Continue
                      </button>
                      {course.status === "completed" && (
                        <button className="flex-1 py-2.5 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg" style={{ backgroundColor: "#16a34a", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                          <Award className="w-4 h-4" />
                          Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border-2 border-dashed" style={{ borderColor: "#ECECF4" }}>
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "#69697B" }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: "#0B0B2C" }}>
                No courses yet
              </h3>
              <p style={{ color: "#69697B" }}>
                Start your learning journey by enrolling in a course
              </p>
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div>
          <h2 className="text-3xl font-bold mb-6" style={{ color: "#0B0B2C" }}>
            Explore More Courses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:translate-y-[-2px]"
                style={{ backgroundColor: "#FAFAFA", border: "1px solid #ECECF4", borderLeft: "4px solid #9EFF1F" }}
              >
                {/* Course Image */}
                <div className="h-40" style={{ background: "linear-gradient(135deg, #9EFF1F15 0%, #F7F7FB 100%)" }}>
                  <BookOpen className="w-12 h-12 mx-auto mt-12" style={{ color: "#3434FF", opacity: 0.25 }} />
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                        {course.title}
                      </h3>
                      <p className="text-sm" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                        by {course.instructor}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-4 h-4 fill-yellow-400" style={{ color: "#f59e0b" }} />
                      <span className="text-sm font-bold" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                        {course.rating}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-5" style={{ color: "#69697B" }}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{course.students} students</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "#ECECF4" }}>
                    <span className="text-2xl font-bold" style={{ color: "#3434FF", fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>
                      ${course.price}
                    </span>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="px-4 py-2.5 rounded-lg font-bold text-white transition-all hover:shadow-lg"
                      style={{ background: "#3434FF", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
