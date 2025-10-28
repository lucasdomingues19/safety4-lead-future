import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, Eye, Globe, Monitor, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PageView {
  id: string;
  page_path: string;
  country: string;
  city: string;
  device_type: string;
  browser: string;
  visited_at: string;
  session_id: string;
}

interface Stats {
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  dailyViews: Array<{ date: string; views: number }>;
  topCountries: Array<{ country: string; views: number }>;
  browserStats: Array<{ browser: string; views: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (error || !roles) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchAnalytics();
    } catch (error) {
      console.error("Admin access error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: pageViews, error } = await supabase
        .from('page_views')
        .select('*')
        .order('visited_at', { ascending: false });

      if (error) throw error;

      if (pageViews) {
        processAnalytics(pageViews);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    }
  };

  const processAnalytics = (views: PageView[]) => {
    const totalViews = views.length;
    const uniqueVisitors = new Set(views.map(v => v.session_id)).size;

    // Top pages
    const pageCount: Record<string, number> = {};
    views.forEach(v => {
      pageCount[v.page_path] = (pageCount[v.page_path] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Device breakdown
    const deviceCount: Record<string, number> = {};
    views.forEach(v => {
      const device = v.device_type || 'unknown';
      deviceCount[device] = (deviceCount[device] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceCount).map(([name, value]) => ({ name, value }));

    // Daily views (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyCount: Record<string, number> = {};
    views.forEach(v => {
      const date = new Date(v.visited_at).toISOString().split('T')[0];
      if (last7Days.includes(date)) {
        dailyCount[date] = (dailyCount[date] || 0) + 1;
      }
    });
    const dailyViews = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: dailyCount[date] || 0
    }));

    // Top countries
    const countryCount: Record<string, number> = {};
    views.forEach(v => {
      if (v.country) {
        countryCount[v.country] = (countryCount[v.country] || 0) + 1;
      }
    });
    const topCountries = Object.entries(countryCount)
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Browser stats
    const browserCount: Record<string, number> = {};
    views.forEach(v => {
      if (v.browser) {
        browserCount[v.browser] = (browserCount[v.browser] || 0) + 1;
      }
    });
    const browserStats = Object.entries(browserCount)
      .map(([browser, views]) => ({ browser, views }))
      .sort((a, b) => b.views - a.views);

    setStats({
      totalViews,
      uniqueVisitors,
      avgSessionDuration: 0, // Can be calculated with duration tracking
      topPages,
      deviceBreakdown,
      dailyViews,
      topCountries,
      browserStats
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11113a] via-slate-900 to-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin || !stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#11113a] via-slate-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Analytics Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Page Views</CardTitle>
              <Eye className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.uniqueVisitors.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Avg. Session Duration</CardTitle>
              <Calendar className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.avgSessionDuration}m</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Views Over Time (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }} />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Top Pages</CardTitle>
              <CardDescription className="text-gray-300">Most visited pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topPages.map((page, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-white">{page.page}</span>
                    <span className="text-white/60">{page.views} views</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Top Countries</CardTitle>
              <CardDescription className="text-gray-300">Traffic by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topCountries.map((country, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-white">{country.country || 'Unknown'}</span>
                    <span className="text-white/60">{country.views} views</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
