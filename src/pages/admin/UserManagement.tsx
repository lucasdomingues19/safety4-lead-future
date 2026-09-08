import { useState } from "react";
import { Search, Plus, Edit, Trash2, Shield, Mail, Calendar } from "lucide-react";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([
    { id: 1, name: "Lucas Domingues", email: "lucas@example.com", role: "Admin", joined: "2024-01-15", status: "active" },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", role: "Instructor", joined: "2024-02-20", status: "active" },
    { id: 3, name: "Mike Chen", email: "mike@example.com", role: "Student", joined: "2024-03-10", status: "active" },
    { id: 4, name: "Emma Wilson", email: "emma@example.com", role: "Student", joined: "2024-03-15", status: "inactive" },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">User Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage platform users, roles, and permissions</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all" style={{ background: "#3434FF" }}>
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Joined</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === "Admin" && <Shield className="w-4 h-4" style={{ color: "#3434FF" }} />}
                        <span className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            background: user.role === "Admin" ? "#3434FF20" : user.role === "Instructor" ? "#a6e21a20" : "#f1f5f920",
                            color: user.role === "Admin" ? "#3434FF" : user.role === "Instructor" ? "#a6e21a" : "#64748b",
                          }}
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          background: user.status === "active" ? "#16a34a20" : "#94a3b820",
                          color: user.status === "active" ? "#16a34a" : "#64748b",
                        }}
                      >
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {user.joined}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors text-red-600">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {[
            { label: "Total Users", value: "248", color: "#3434FF" },
            { label: "Active Users", value: "192", color: "#a6e21a" },
            { label: "Instructors", value: "12", color: "#16a34a" },
            { label: "Admin", value: "2", color: "#f59e0b" },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
