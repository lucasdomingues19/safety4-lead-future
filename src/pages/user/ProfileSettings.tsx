import { useState } from "react";
import { User, Mail, Lock, Bell, Shield, LogOut, Upload, X } from "lucide-react";

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [name, setName] = useState("Lucas Domingues");
  const [email, setEmail] = useState("lucas.domingues1985@gmail.com");
  const [bio, setBio] = useState("EHS Professional | Safety Technology Enthusiast");
  const [photo, setPhoto] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account and preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "security", label: "Security", icon: Lock },
                { id: "notifications", label: "Notifications", icon: Bell },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                    activeTab === id
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  style={activeTab === id ? { background: "#3434FF10", color: "#3434FF" } : {}}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Photo Upload */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Photo</h2>
                  <div className="flex items-start gap-6">
                    {photo ? (
                      <div className="relative">
                        <img src={photo} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                        <button
                          onClick={() => setPhoto("")}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <User className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="block mb-2">
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white cursor-pointer transition-all" style={{ background: "#3434FF" }}>
                          <Upload className="w-4 h-4" />
                          Upload Photo
                        </span>
                      </label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        JPG, PNG or GIF. Max 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Basic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button className="mt-6 px-6 py-2.5 rounded-lg font-bold text-white transition-all" style={{ background: "#3434FF" }}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button className="mt-6 px-6 py-2.5 rounded-lg font-bold text-white transition-all" style={{ background: "#3434FF" }}>
                    Update Password
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Active Sessions
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Manage devices where you're logged in</p>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Chrome on macOS</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Current session • Last active now</p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 font-semibold text-sm">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { title: "Course Updates", desc: "Get notified when new content is added" },
                    { title: "Comments & Discussions", desc: "Notifications for course discussions" },
                    { title: "Certificate Alerts", desc: "Alerts when you complete courses" },
                    { title: "Weekly Summary", desc: "Receive weekly learning summary" },
                  ].map((item, i) => (
                    <label key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded" style={{ accentColor: "#3434FF" }} />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <button className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
