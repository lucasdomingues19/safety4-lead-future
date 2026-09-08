import { useState } from "react";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, GripVertical, Play, Clock, Lock, Eye, Publish, Save } from "lucide-react";

const CourseEditor = () => {
  const [course, setCourse] = useState({
    id: 1,
    title: "Introduction to AI-Powered EHS",
    description: "Learn how artificial intelligence is transforming modern EHS practices",
    status: "draft",
  });

  const [modules, setModules] = useState([
    {
      id: 1,
      title: "Module 1: Getting Started",
      position: 1,
      expanded: true,
      lessons: [
        { id: 1, title: "Introduction to AI-Powered EHS", duration: 13, locked: false, position: 1 },
        { id: 2, title: "Why EHS Needs AI", duration: 8, locked: false, position: 2 },
        { id: 3, title: "Industry Trends 2024", duration: 10, locked: false, position: 3 },
      ],
    },
    {
      id: 2,
      title: "Module 2: Core Concepts",
      position: 2,
      expanded: false,
      lessons: [
        { id: 4, title: "Machine Learning Fundamentals", duration: 15, locked: false, position: 1 },
        { id: 5, title: "Data for EHS", duration: 12, locked: false, position: 2 },
      ],
    },
  ]);

  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);

  const toggleModule = (moduleId: number) => {
    setModules(
      modules.map((m) => (m.id === moduleId ? { ...m, expanded: !m.expanded } : m))
    );
  };

  const handleDeleteModule = (moduleId: number) => {
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  const handleDeleteLesson = (moduleId: number, lessonId: number) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      )
    );
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalDuration = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((ls, l) => ls + l.duration, 0),
    0
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {course.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{course.description}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Modules:
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {modules.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Lessons:
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {totalLessons}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {totalDuration} min
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                className="px-4 py-2.5 rounded-lg text-white font-semibold transition-all flex items-center gap-2"
                style={{ background: "#3434FF" }}
              >
                <Publish className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-4">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: course.status === "published" ? "#16a34a20" : "#f59e0b20",
                color: course.status === "published" ? "#16a34a" : "#f59e0b",
              }}
            >
              {course.status === "published" ? "Published" : "Draft"}
            </span>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1">
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Add Module Button */}
        <button
          onClick={() => setShowModuleForm(true)}
          className="mb-8 flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white"
          style={{ background: "#3434FF" }}
        >
          <Plus className="w-5 h-5" />
          Add Module
        </button>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module, idx) => (
            <div
              key={module.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* Module Header */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                <div className="flex items-center gap-4 flex-1">
                  <GripVertical className="w-5 h-5 text-slate-400" />
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    {module.expanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {module.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {module.lessons.length} lessons •{" "}
                      {module.lessons.reduce((sum, l) => sum + l.duration, 0)} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingModule(module)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-950/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Lessons */}
              {module.expanded && (
                <div className="border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <GripVertical className="w-5 h-5 text-slate-400" />
                        <Play className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {lesson.title}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {lesson.duration} min
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingLesson(lesson)}
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(module.id, lesson.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-950/30 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Lesson Button */}
                  <div className="p-4">
                    <button
                      onClick={() => setShowLessonForm(true)}
                      className="w-full py-2 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Lesson
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {modules.length === 0 && (
          <div className="text-center py-12">
            <Play className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No modules yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start building your course by adding the first module
            </p>
            <button
              onClick={() => setShowModuleForm(true)}
              className="px-6 py-2.5 rounded-lg font-bold text-white"
              style={{ background: "#3434FF" }}
            >
              Create First Module
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;
