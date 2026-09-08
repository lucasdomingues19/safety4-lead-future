import { useState } from "react";
import { ChevronRight, ChevronLeft, Clock, BookOpen, MessageCircle, Download, Share2, Flag, Menu, X, CheckCircle2, Lock, Home, User, Settings, LogOut, Grid } from "lucide-react";
import { Lesson } from "@/lib/lms";
import { LessonPlayer } from "@/components/learn/LessonPlayer";

const Phase2Redesigned = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transcription" | "resources" | "discussion">("overview");
  const [currentLessonId, setCurrentLessonId] = useState(0);

  const lesson: Lesson = {
    id: "lesson-1",
    module_id: "module-1",
    title: "Introduction to AI-Powered EHS",
    description: "Learn the fundamentals of implementing AI in your EHS programs",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    video_duration_seconds: 780,
    content: ``,
    position: 1,
    is_locked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const modules = [
    {
      id: "module-1",
      title: "Module 1: Getting Started",
      lessons: [
        { id: 0, title: "Introduction to AI-Powered EHS", duration: 13, completed: false, locked: false },
        { id: 1, title: "Why EHS Needs AI", duration: 8, completed: true, locked: false },
        { id: 2, title: "Industry Trends 2024", duration: 10, completed: false, locked: false },
      ],
    },
    {
      id: "module-2",
      title: "Module 2: Core Concepts",
      lessons: [
        { id: 3, title: "Machine Learning Fundamentals", duration: 15, completed: false, locked: false },
        { id: 4, title: "Data for EHS", duration: 12, completed: false, locked: false },
        { id: 5, title: "Case Study: Risk Prediction", duration: 18, completed: false, locked: true },
      ],
    },
  ];

  const courseProgress = 25;
  const totalLessons = 6;
  const completedLessons = 1;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg" style={{ background: "#3434FF" }} />
              <span className="font-bold text-slate-900 dark:text-white">SafetyTech</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/learn" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">
                <Home className="w-4 h-4" />
                Dashboard
              </a>
              <a href="/learn" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">
                <Grid className="w-4 h-4" />
                My Courses
              </a>
              <a href="#" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">
                <MessageCircle className="w-4 h-4" />
                Support
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
              <User className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-slate-900 dark:bg-slate-800 px-6 py-8 border-b border-slate-200 dark:border-slate-700 flex-shrink-0" style={{ background: "#3434FF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-white leading-tight mb-3">
                Introduction to AI-Powered EHS
              </h1>
              <p className="text-blue-100 text-lg">
                Learn how artificial intelligence is transforming modern EHS practices
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-white text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-blue-100 text-xs uppercase tracking-wider font-bold">Instructor</p>
                  <p className="font-semibold">Lucas Domingues</p>
                </div>
                <div>
                  <p className="text-blue-100 text-xs uppercase tracking-wider font-bold">Rating</p>
                  <p className="font-semibold">★ 4.8 (342 reviews)</p>
                </div>
                <div className="flex gap-4 pt-2">
                  <div>
                    <p className="text-blue-100 text-xs uppercase tracking-wider font-bold">Duration</p>
                    <p className="font-semibold">12 hours</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs uppercase tracking-wider font-bold">Level</p>
                    <p className="font-semibold">Intermediate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-80" : "w-0"} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 flex flex-col flex-shrink-0`}>
          {sidebarOpen && (
            <>
              {/* Sidebar Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-4">
                  Introduction to AI-Powered EHS
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{completedLessons}/{totalLessons}</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full transition-all" style={{ background: "linear-gradient(90deg, #3434FF 0%, #a6e21a 100%)", width: `${courseProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Modules */}
              <div className="flex-1 overflow-y-auto">
                {modules.map((module) => (
                  <div key={module.id} className="border-b border-slate-200 dark:border-slate-800">
                    <div className="px-6 py-3">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {module.title}
                      </h3>
                    </div>
                    <div className="space-y-1 px-3 pb-3">
                      {module.lessons.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setCurrentLessonId(l.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-start gap-3 ${
                            currentLessonId === l.id
                              ? "bg-blue-50 dark:bg-blue-950/40"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {l.locked ? (
                              <Lock className="w-4 h-4 text-slate-400" />
                            ) : l.completed ? (
                              <CheckCircle2 className="w-4 h-4" style={{ color: "#a6e21a" }} />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {l.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {l.duration} min
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar Footer */}
              <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-3 flex-shrink-0">
                <button className="w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all text-sm" style={{ background: "#3434FF" }}>
                  Get Certificate
                </button>
                <button className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors text-sm">
                  Share
                </button>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0">
                  {sidebarOpen ? (
                    <X className="w-5 h-5 text-slate-900 dark:text-white" />
                  ) : (
                    <Menu className="w-5 h-5 text-slate-900 dark:text-white" />
                  )}
                </button>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {lesson.title}
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Module 1 • Lesson 1</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                  <Flag className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Video */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
                    <LessonPlayer lesson={lesson} userId="student-123" onComplete={() => console.log("Lesson completed!")} />
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-slate-200 dark:border-slate-800">
                    <div className="flex gap-6">
                      {[
                        { id: "overview", label: "Overview" },
                        { id: "transcription", label: "Transcription" },
                        { id: "resources", label: "Resources" },
                        { id: "discussion", label: "Discussion" },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id as any)}
                          className={`pb-4 font-semibold text-sm transition-all border-b-2 ${
                            activeTab === id
                              ? "border-blue-600 text-blue-600 dark:text-blue-400"
                              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                          style={activeTab === id ? { borderBottomColor: "#3434FF", color: "#3434FF" } : {}}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-4">
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Lesson Overview</h2>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                            In this lesson, you'll learn the foundational concepts of artificial intelligence and how it applies to Environmental Health and Safety. We'll explore real-world examples and discuss practical implementation strategies.
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Key Topics</h3>
                          <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
                            <li className="flex gap-3">
                              <span style={{ color: "#3434FF" }}>•</span>
                              <span>What is AI and machine learning?</span>
                            </li>
                            <li className="flex gap-3">
                              <span style={{ color: "#3434FF" }}>•</span>
                              <span>AI applications in EHS</span>
                            </li>
                            <li className="flex gap-3">
                              <span style={{ color: "#3434FF" }}>•</span>
                              <span>Current industry trends</span>
                            </li>
                            <li className="flex gap-3">
                              <span style={{ color: "#3434FF" }}>•</span>
                              <span>Getting started with your first AI project</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeTab === "transcription" && (
                      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#3434FF" }}>00:00 - Introduction</p>
                          <p>Welcome to this lesson on AI in EHS. Today we'll explore how artificial intelligence is transforming the way organizations approach safety and compliance.</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#3434FF" }}>01:30 - What is AI?</p>
                          <p>Artificial Intelligence refers to computer systems that can perform tasks that typically require human intelligence. This includes learning from experience, recognizing patterns, and understanding language.</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#3434FF" }}>03:45 - AI Applications in EHS</p>
                          <p>Organizations are using AI to predict safety incidents before they happen. Machine learning models can analyze historical safety data to identify patterns and risk factors.</p>
                        </div>
                      </div>
                    )}

                    {activeTab === "resources" && (
                      <div className="space-y-3">
                        {["AI in EHS Checklist", "Implementation Guide", "Industry Report 2024"].map((resource, i) => (
                          <a key={i} href="#" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                            <Download className="w-5 h-5 flex-shrink-0" style={{ color: "#3434FF" }} />
                            <span className="font-semibold text-slate-900 dark:text-white text-sm group-hover:opacity-80">{resource}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {activeTab === "discussion" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">Alex Thompson</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">2 hours ago</p>
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-sm">
                            Great introduction! How do you recommend getting started with data collection?
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4 hidden lg:block">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Lesson Info</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#3434FF" }}>Duration</p>
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                          <Clock className="w-4 h-4" style={{ color: "#3434FF" }} />
                          {lesson.duration_minutes} min
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#3434FF" }}>Status</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold" style={{ background: "#a6e21a20", color: "#a6e21a" }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: "#a6e21a" }} />
                          In Progress
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl p-5 text-white" style={{ background: "#3434FF" }}>
                    <h3 className="font-bold mb-4 text-sm">Course Progress</h3>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-90">Overall</p>
                        <p className="font-bold text-sm">{courseProgress}%</p>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full" style={{ background: "#a6e21a", width: `${courseProgress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button disabled className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-600 font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed text-sm">
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button className="w-full py-2.5 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all text-sm" style={{ background: "#3434FF" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2Redesigned;
