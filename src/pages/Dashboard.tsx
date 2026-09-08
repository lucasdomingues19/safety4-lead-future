import { useState } from "react";
import { BookOpen, TrendingUp, Award, Clock, ArrowRight, Eye, MessageCircle, HelpCircle, Play, Zap } from "lucide-react";
import { LmsChat } from "@/components/LmsChat";

const Dashboard = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const user = {
    name: "John Doe",
    email: "john@example.com",
  };

  const stats = {
    enrolledCourses: 2,
    hoursLearned: 28,
    certificatesEarned: 1,
    currentStreak: 7,
  };

  const recentActivity = [
    { id: 1, type: "lesson_completed", course: "Introduction to AI-Powered EHS", lesson: "Introduction to AI-Powered EHS", time: "2 hours ago" },
    { id: 2, type: "course_enrolled", course: "Data Analytics for EHS", time: "1 day ago" },
    { id: 3, type: "certificate_earned", course: "Advanced Safety Management", time: "3 days ago" },
  ];

  const continueLearning = [
    {
      id: 1,
      course: "Introduction to AI-Powered EHS",
      progress: 45,
      lastAccessed: "Today at 2:30 PM",
      timeRemaining: "6.6 hours",
    },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Google Fonts import for Poppins */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        body, html { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* Accent bar */}
      <div className="fixed left-0 top-0 w-1 h-screen" style={{ backgroundColor: "#3434FF" }}></div>

      {/* Header */}
      <div className="bg-white px-8 py-12 ml-1">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-3" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-lg" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400, lineHeight: 1.6 }}>
              Continue your learning journey or explore new courses
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { label: "Enrolled Courses", value: stats.enrolledCourses, icon: BookOpen, color: "#3434FF", bg: "rgba(52, 52, 255, 0.08)" },
              { label: "Hours Learned", value: stats.hoursLearned, icon: Clock, color: "#9EFF1F", bg: "rgba(158, 255, 31, 0.08)" },
              { label: "Certificates", value: stats.certificatesEarned, icon: Award, color: "#16a34a", bg: "rgba(22, 163, 74, 0.08)" },
              { label: "Day Streak", value: stats.currentStreak, icon: TrendingUp, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="rounded-2xl p-6 transition-all hover:shadow-lg" style={{ backgroundColor: stat.bg, borderLeft: `4px solid ${stat.color}` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: "0.5px" }}>
                        {stat.label}
                      </p>
                      <p className="text-5xl font-bold" style={{ color: stat.color, fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>
                        {stat.value}
                      </p>
                    </div>
                    <Icon className="w-12 h-12" style={{ color: stat.color, opacity: 0.2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12 ml-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Continue Learning */}
            {continueLearning.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-8" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "-0.3px" }}>
                  Continue Learning
                </h2>

                <div className="space-y-4">
                  {continueLearning.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl p-7 hover:shadow-xl transition-all overflow-hidden relative group"
                      style={{
                        backgroundColor: "#F7F7FB",
                        border: "1px solid #ECECF4",
                        borderLeft: "4px solid #3434FF"
                      }}
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                            {item.course}
                          </h3>
                          <p className="text-sm" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                            Last accessed {item.lastAccessed}
                          </p>
                        </div>
                        <button
                          className="px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 flex-shrink-0 hover:shadow-lg"
                          style={{ background: "#3434FF", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                        >
                          <Play className="w-4 h-4" />
                          Continue
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>Progress</span>
                          <span className="font-bold" style={{ color: "#3434FF", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px" }}>
                            {item.progress}%
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#ECECF4" }}>
                          <div
                            className="h-full transition-all"
                            style={{
                              background: "linear-gradient(90deg, #3434FF 0%, #9EFF1F 100%)",
                              width: `${item.progress}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                          {item.timeRemaining} remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h2 className="text-3xl font-bold mb-8" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "-0.3px" }}>
                Recent Activity
              </h2>

              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="rounded-xl p-5 flex items-start gap-4 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: "#FAFAFA",
                      border: "1px solid #ECECF4",
                      borderLeft: idx === 0 ? "3px solid #3434FF" : "3px solid #E5E7EB"
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F5F7FF" }}>
                      {activity.type === "lesson_completed" && <Eye className="w-5 h-5" style={{ color: "#3434FF" }} />}
                      {activity.type === "course_enrolled" && <BookOpen className="w-5 h-5" style={{ color: "#3434FF" }} />}
                      {activity.type === "certificate_earned" && <Award className="w-5 h-5" style={{ color: "#3434FF" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                        {activity.type === "lesson_completed" && `Completed "${activity.lesson}"`}
                        {activity.type === "course_enrolled" && `Enrolled in ${activity.course}`}
                        {activity.type === "certificate_earned" && `Earned certificate for ${activity.course}`}
                      </p>
                      <p className="text-xs" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Links */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#F7F7FB", border: "1px solid #ECECF4" }}>
              <h3 className="font-bold mb-5" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 700 }}>
                Quick Links
              </h3>
              <div className="space-y-2">
                {[
                  { href: "/student/courses", icon: BookOpen, label: "My Courses" },
                  { href: "/support", icon: HelpCircle, label: "Support" },
                  { href: "#", icon: MessageCircle, label: "Community" },
                ].map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={i}
                      href={link.href}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors cursor-pointer group"
                    >
                      <span className="text-sm font-bold flex items-center gap-3" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                        <Icon className="w-4 h-4" style={{ color: "#3434FF" }} />
                        {link.label}
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: "#69697B" }} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="rounded-2xl p-6 relative overflow-hidden" style={{ backgroundColor: "rgba(245, 158, 11, 0.08)", border: "2px solid #f59e0b" }}>
              <div className="text-center">
                <div className="text-4xl mb-3">🔥</div>
                <h3 className="font-bold mb-2" style={{ color: "#f59e0b", fontFamily: "'Poppins', sans-serif", fontSize: "18px", fontWeight: 700 }}>
                  7-Day Streak!
                </h3>
                <p className="text-sm" style={{ color: "#f59e0b", fontFamily: "'Poppins', sans-serif", fontWeight: 400, lineHeight: 1.5 }}>
                  Keep learning daily to maintain your streak
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#F5F7FF", border: "1px solid #3434FF", borderLeft: "4px solid #3434FF" }}>
              <h3 className="font-bold mb-4" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 700 }}>
                Recommended for You
              </h3>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF" }}>
                <p className="text-sm font-bold mb-2" style={{ color: "#0B0B2C", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                  Data Analytics for EHS
                </p>
                <p className="text-xs mb-4" style={{ color: "#69697B", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                  Based on your learning pattern
                </p>
                <button className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:shadow-lg" style={{ background: "#3434FF", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                  Explore
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 hover:shadow-xl z-40"
        style={{ background: "#3434FF", fontFamily: "'Poppins', sans-serif" }}
        title="Chat with AI Assistant"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Chat Widget */}
      {chatOpen && (
        <LmsChat
          userId={user.email}
          userEmail={user.email}
          userRole="student"
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
