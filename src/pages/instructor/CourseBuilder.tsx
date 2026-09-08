import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Publish, Archive, ChevronRight, Grid, BookOpen, Image as ImageIcon, DollarSign } from "lucide-react";

const CourseBuilder = () => {
  const [activeTab, setActiveTab] = useState<"courses" | "editor">("courses");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction to AI-Powered EHS",
      slug: "intro-ai-ehs",
      status: "draft",
      students: 0,
      modules: 3,
      image: null,
      price: 0,
      description: "Learn how artificial intelligence is transforming modern EHS practices",
    },
    {
      id: 2,
      title: "Advanced Safety Management",
      slug: "advanced-safety",
      status: "published",
      students: 45,
      modules: 5,
      image: null,
      price: 49.99,
      description: "Deep dive into modern safety management techniques",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    image: null as any,
    level: "beginner",
  });

  const handleCreateCourse = () => {
    setFormData({ title: "", description: "", price: 0, image: null, level: "beginner" });
    setSelectedCourse(null);
    setActiveTab("editor");
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      image: course.image,
      level: "beginner",
    });
    setActiveTab("editor");
  };

  const handleSaveCourse = () => {
    setActiveTab("courses");
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Course Builder</h1>
            <p className="text-slate-600 dark:text-slate-400">Create and manage your courses</p>
          </div>
          <button
            onClick={handleCreateCourse}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all"
            style={{ background: "#3434FF" }}
          >
            <Plus className="w-5 h-5" />
            New Course
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "courses" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Total Courses", value: courses.length.toString(), icon: BookOpen, color: "#3434FF" },
                { label: "Published", value: courses.filter(c => c.status === "published").length.toString(), icon: Publish, color: "#16a34a" },
                { label: "Total Students", value: courses.reduce((sum, c) => sum + c.students, 0).toString(), icon: Grid, color: "#a6e21a" },
                { label: "Revenue", value: "$" + (courses.reduce((sum, c) => sum + (c.price * c.students), 0)).toFixed(0), icon: DollarSign, color: "#f59e0b" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold" style={{ color: stat.color }}>
                          {stat.value}
                        </p>
                      </div>
                      <Icon className="w-8 h-8" style={{ color: stat.color, opacity: 0.2 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Course Image */}
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-slate-100 dark:from-blue-950/30 dark:to-slate-900 flex items-center justify-center">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-slate-400" />
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{course.title}</h3>
                      <span
                        className="px-2 py-1 rounded text-xs font-bold whitespace-nowrap"
                        style={{
                          background: course.status === "published" ? "#16a34a20" : "#f59e0b20",
                          color: course.status === "published" ? "#16a34a" : "#f59e0b",
                        }}
                      >
                        {course.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs">Modules</p>
                        <p className="font-bold text-slate-900 dark:text-white">{course.modules}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs">Students</p>
                        <p className="font-bold text-slate-900 dark:text-white">{course.students}</p>
                      </div>
                      {course.price > 0 && (
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 text-xs">Price</p>
                          <p className="font-bold text-slate-900 dark:text-white">${course.price}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 font-semibold text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 font-semibold text-sm">
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 font-semibold text-sm">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "editor" && (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedCourse ? "Edit Course" : "Create New Course"}
                </h2>
                <button
                  onClick={() => setActiveTab("courses")}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Course Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Introduction to AI-Powered EHS"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what students will learn..."
                  />
                </div>

                {/* Grid: Price & Level */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                      Price (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-600 dark:text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="49.99"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                      Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Course Image */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Course Image
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 mb-1">
                      Drag and drop your image here
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      or click to select (PNG, JPG, max 5MB)
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="flex-1 py-3 rounded-lg font-bold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCourse}
                    className="flex-1 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
                    style={{ background: "#3434FF" }}
                  >
                    <Publish className="w-5 h-5" />
                    {selectedCourse ? "Update Course" : "Create Course"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseBuilder;
