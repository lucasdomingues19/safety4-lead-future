import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LogOut, Users, Eye, Globe, Monitor, Calendar, Download, Trash2, ShoppingCart } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  created_at: string;
  message?: string;
  role?: string;
  inquiry_type?: string;
}

interface Stats {
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  offerClicks: number;
  topPages: Array<{ page: string; views: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  dailyViews: Array<{ date: string; views: number }>;
  dailyUniqueVisitors: Array<{ date: string; visitors: number }>;
  topCountries: Array<{ country: string; views: number }>;
  browserStats: Array<{ browser: string; views: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'leads'>('analytics');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
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
      await fetchLeads();
    } catch (error) {
      console.error("Admin access error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setLeads(data);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads data");
    }
  };

  const exportLeadsToCSV = () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Source', 'Date'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.name}"`,
        `"${lead.email}"`,
        `"${lead.phone || 'N/A'}"`,
        `"${lead.source}"`,
        `"${new Date(lead.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Leads exported successfully");
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(leads.filter(lead => lead.id !== id));
      toast.success("Lead deleted successfully");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [pageViewsResult, offerClicksResult] = await Promise.all([
        supabase
          .from('page_views')
          .select('*')
          .order('visited_at', { ascending: false }),
        supabase
          .from('user_events')
          .select('*')
          .eq('event_type', 'click')
      ]);

      if (pageViewsResult.error) throw pageViewsResult.error;

      // Count offer-related clicks
      const offerClicks = (offerClicksResult.data || []).filter(event => {
        const eventData = JSON.stringify(event.event_data || {}).toLowerCase();
        return eventData.includes('offer') || 
               eventData.includes('enroll') || 
               eventData.includes('start learning') || 
               eventData.includes('founding') ||
               eventData.includes('safetyacademy.mykajabi.com');
      }).length;

      if (pageViewsResult.data) {
        processAnalytics(pageViewsResult.data, offerClicks);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    }
  };

  const processAnalytics = (views: PageView[], offerClicks: number = 0) => {
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
    const dailySessionSets: Record<string, Set<string>> = {};
    
    views.forEach(v => {
      const date = new Date(v.visited_at).toISOString().split('T')[0];
      if (last7Days.includes(date)) {
        dailyCount[date] = (dailyCount[date] || 0) + 1;
        
        if (!dailySessionSets[date]) {
          dailySessionSets[date] = new Set();
        }
        dailySessionSets[date].add(v.session_id);
      }
    });
    
    const dailyViews = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: dailyCount[date] || 0
    }));

    const dailyUniqueVisitors = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: dailySessionSets[date]?.size || 0
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
      .slice(0, 10);

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
      offerClicks,
      topPages,
      deviceBreakdown,
      dailyViews,
      dailyUniqueVisitors,
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
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveTab('analytics')}
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            className={activeTab === 'analytics' ? '' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}
          >
            <Eye className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button
            onClick={() => setActiveTab('leads')}
            variant={activeTab === 'leads' ? 'default' : 'outline'}
            className={activeTab === 'leads' ? '' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}
          >
            <Users className="mr-2 h-4 w-4" />
            Leads ({leads.length})
          </Button>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 border-lime-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Offer Clicks</CardTitle>
              <ShoppingCart className="h-4 w-4 text-lime-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-lime-400">{stats.offerClicks.toLocaleString()}</div>
              <p className="text-xs text-white/60 mt-1">Enrollment button clicks</p>
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
              <CardTitle className="text-white">Unique Visitors (Last 7 Days)</CardTitle>
              <CardDescription className="text-gray-300">Distinct visitors per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyUniqueVisitors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }} />
                  <Legend />
                  <Line type="monotone" dataKey="visitors" stroke="#00C49F" strokeWidth={2} name="Unique Visitors" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Third row - Device Breakdown */}
        <div className="grid grid-cols-1 gap-6">
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
          </>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Lead Management</CardTitle>
                    <CardDescription className="text-gray-300">
                      View and export leads from assessment and contact form. Click any row to view full details.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={exportLeadsToCSV}
                    className="bg-lime-500 hover:bg-lime-600 text-black"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-white/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-white/5">
                        <TableHead className="text-white">Name</TableHead>
                        <TableHead className="text-white">Email</TableHead>
                        <TableHead className="text-white">Phone</TableHead>
                        <TableHead className="text-white">Source</TableHead>
                        <TableHead className="text-white">Date</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-white/60 py-8">
                            No leads captured yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        leads.map((lead) => (
                          <TableRow 
                            key={lead.id} 
                            className="border-white/20 hover:bg-white/5 cursor-pointer"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <TableCell className="text-white">{lead.name}</TableCell>
                            <TableCell className="text-white">{lead.email}</TableCell>
                            <TableCell className="text-white">{lead.phone || 'N/A'}</TableCell>
                            <TableCell className="text-white">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                lead.source === 'assessment' 
                                  ? 'bg-blue-500/20 text-blue-300' 
                                  : lead.source === 'contact_form'
                                  ? 'bg-green-500/20 text-green-300'
                                  : lead.source === 'cohort-pre-enrollment'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-orange-500/20 text-orange-300'
                              }`}>
                                {lead.source === 'assessment' ? 'Assessment' : 
                                 lead.source === 'contact_form' ? 'Contact Form' :
                                 lead.source === 'cohort-pre-enrollment' ? 'Cohort' : 'eBook'}
                              </span>
                            </TableCell>
                            <TableCell className="text-white">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-white" onClick={(e) => e.stopPropagation()}>
                              <Button
                                onClick={() => deleteLead(lead.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Lead Detail Dialog */}
            <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
              <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Lead Details</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Full information for this lead
                  </DialogDescription>
                </DialogHeader>
                {selectedLead && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Name</label>
                        <p className="text-white font-medium">{selectedLead.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <p className="text-white font-medium">{selectedLead.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Phone</label>
                        <p className="text-white font-medium">{selectedLead.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Source</label>
                        <p className="text-white font-medium capitalize">{selectedLead.source.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Date</label>
                        <p className="text-white font-medium">
                          {new Date(selectedLead.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {selectedLead.role && (
                        <div>
                          <label className="text-sm text-gray-400">Role</label>
                          <p className="text-white font-medium">{selectedLead.role}</p>
                        </div>
                      )}
                      {selectedLead.inquiry_type && (
                        <div>
                          <label className="text-sm text-gray-400">Inquiry Type</label>
                          <p className="text-white font-medium capitalize">{selectedLead.inquiry_type.replace('_', ' ')}</p>
                        </div>
                      )}
                    </div>
                    {selectedLead.message && (
                      <div className="col-span-2">
                        <label className="text-sm text-gray-400">Message</label>
                        <div className="mt-2 p-4 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-white whitespace-pre-wrap">{selectedLead.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
