import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Users, TrendingUp, Award } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts";

interface ScorecardRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  overall_score: number;
  rank_number: number;
  rank_label: string;
  category_scores: { category: string; percentage: number }[];
  org_maturity_scores: { category: string; percentage: number }[] | null;
  created_at: string;
}

const RANK_BANDS = [
  { label: "Beginner", min: 0, max: 34, color: "#ef4444" },
  { label: "Early Adopter", min: 35, max: 54, color: "#f97316" },
  { label: "Developing", min: 55, max: 69, color: "#eab308" },
  { label: "Advanced", min: 70, max: 84, color: "#3b82f6" },
  { label: "Leader", min: 85, max: 100, color: "#22c55e" },
];

type DateFilter = "7days" | "30days" | "90days" | "alltime";

const normalizeCategory = (cat: string): string => {
  const map: Record<string, string> = { "Technology Adoption": "Tech Saviness" };
  return map[cat] || cat;
};

const CANONICAL_CATEGORIES = [
  "Awareness & Mindset",
  "Tech Saviness",
  "Risk & Compliance",
  "Change Management",
  "Leadership & Future Readiness",
];

export const CompanyInsightsTab = () => {
  const [results, setResults] = useState<ScorecardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("alltime");
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("scorecard_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResults((data as any[]) || []);
    } catch (err) {
      console.error("Error fetching scorecard results:", err);
    } finally {
      setLoading(false);
    }
  };

  const companies = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => { if (r.company_name) set.add(r.company_name); });
    return Array.from(set).sort();
  }, [results]);

  const filtered = useMemo(() => {
    let data = results;
    if (selectedCompany !== "all") {
      data = data.filter((r) => r.company_name === selectedCompany);
    }
    if (dateFilter !== "alltime") {
      const days = dateFilter === "7days" ? 7 : dateFilter === "30days" ? 30 : 90;
      const cutoff = new Date(Date.now() - days * 86400000);
      data = data.filter((r) => new Date(r.created_at) >= cutoff);
    }
    return data;
  }, [results, selectedCompany, dateFilter]);

  // Data for the selected/checked companies comparison
  const comparisonData = useMemo(() => {
    if (selectedCompanies.size === 0) return null;
    return Array.from(selectedCompanies).map((company) => {
      const companyResults = filtered.filter((r) => r.company_name === company);
      const catTotals: Record<string, { sum: number; count: number }> = {};
      const orgTotals: Record<string, { sum: number; count: number }> = {};
      CANONICAL_CATEGORIES.forEach((c) => {
        catTotals[c] = { sum: 0, count: 0 };
        orgTotals[c] = { sum: 0, count: 0 };
      });
      companyResults.forEach((r) => {
        const scores = r.category_scores as { category: string; percentage: number }[];
        if (Array.isArray(scores)) {
          scores.forEach((c) => {
            const n = normalizeCategory(c.category);
            if (catTotals[n]) { catTotals[n].sum += c.percentage; catTotals[n].count += 1; }
          });
        }
        const orgScores = r.org_maturity_scores as { category: string; percentage: number }[] | null;
        if (Array.isArray(orgScores)) {
          orgScores.forEach((c) => {
            const n = normalizeCategory(c.category);
            if (orgTotals[n]) { orgTotals[n].sum += c.percentage; orgTotals[n].count += 1; }
          });
        }
      });
      return {
        company,
        count: companyResults.length,
        categories: CANONICAL_CATEGORIES.map((cat) => ({
          category: cat,
          personal: catTotals[cat].count > 0 ? Math.round(catTotals[cat].sum / catTotals[cat].count) : 0,
          org: orgTotals[cat].count > 0 ? Math.round(orgTotals[cat].sum / orgTotals[cat].count) : 0,
          hasOrg: orgTotals[cat].count > 0,
        })),
      };
    });
  }, [selectedCompanies, filtered]);

  const avgScore = useMemo(() => {
    if (!filtered.length) return 0;
    return Math.round(filtered.reduce((s, r) => s + r.overall_score, 0) / filtered.length);
  }, [filtered]);

  const radarData = useMemo(() => {
    if (!filtered.length) return [];
    const catTotals: Record<string, { sum: number; count: number }> = {};
    const orgTotals: Record<string, { sum: number; count: number }> = {};
    CANONICAL_CATEGORIES.forEach((c) => {
      catTotals[c] = { sum: 0, count: 0 };
      orgTotals[c] = { sum: 0, count: 0 };
    });
    filtered.forEach((r) => {
      const scores = r.category_scores as { category: string; percentage: number }[];
      if (Array.isArray(scores)) {
        scores.forEach((c) => {
          const n = normalizeCategory(c.category);
          if (catTotals[n]) { catTotals[n].sum += c.percentage; catTotals[n].count += 1; }
        });
      }
      const orgScores = r.org_maturity_scores as { category: string; percentage: number }[] | null;
      if (Array.isArray(orgScores)) {
        orgScores.forEach((c) => {
          const n = normalizeCategory(c.category);
          if (orgTotals[n]) { orgTotals[n].sum += c.percentage; orgTotals[n].count += 1; }
        });
      }
    });
    const hasAnyOrg = CANONICAL_CATEGORIES.some((c) => orgTotals[c].count > 0);
    return CANONICAL_CATEGORIES.map((category) => ({
      category: category.length > 20 ? category.split(" ").slice(0, 2).join(" ") : category,
      fullCategory: category,
      "Personal Avg": catTotals[category].count > 0 ? Math.round(catTotals[category].sum / catTotals[category].count) : 0,
      ...(hasAnyOrg ? { "Org Maturity Avg": orgTotals[category].count > 0 ? Math.round(orgTotals[category].sum / orgTotals[category].count) : 0 } : {}),
    }));
  }, [filtered]);

  const hasOrgData = useMemo(() => radarData.length > 0 && "Org Maturity Avg" in (radarData[0] || {}), [radarData]);

  const distributionData = useMemo(() => {
    return RANK_BANDS.map((band) => ({
      name: band.label,
      count: filtered.filter((r) => r.overall_score >= band.min && r.overall_score <= band.max).length,
      color: band.color,
    }));
  }, [filtered]);

  const topCategory = useMemo(() => {
    if (!radarData.length) return "—";
    return radarData.reduce((a, b) => (a["Personal Avg"] > b["Personal Avg"] ? a : b)).fullCategory;
  }, [radarData]);

  const bottomCategory = useMemo(() => {
    if (!radarData.length) return "—";
    return radarData.reduce((a, b) => (a["Personal Avg"] < b["Personal Avg"] ? a : b)).fullCategory;
  }, [radarData]);

  const toggleCompanySelection = (company: string) => {
    setSelectedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) next.delete(company);
      else next.add(company);
      return next;
    });
  };

  const selectAllCompanies = () => {
    if (selectedCompanies.size === companies.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(companies));
    }
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading company insights...</div>;
  }

  const COMPARISON_COLORS = ["#D6FF00", "#3b82f6", "#f97316", "#22c55e", "#a855f7"];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs text-white/60 uppercase tracking-wider">Company</label>
          <Select value={selectedCompany} onValueChange={(v) => { setSelectedCompany(v); setSelectedCompanies(new Set()); }}>
            <SelectTrigger className="w-[220px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="All companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {(["7days", "30days", "90days", "alltime"] as DateFilter[]).map((d) => (
            <Button
              key={d}
              onClick={() => setDateFilter(d)}
              variant={dateFilter === d ? "default" : "outline"}
              size="sm"
              className={dateFilter === d ? "bg-blue-600 hover:bg-blue-700" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}
            >
              {d === "7days" ? "7 Days" : d === "30days" ? "30 Days" : d === "90days" ? "90 Days" : "All Time"}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Respondents</CardTitle>
            <Users className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Avg. Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{avgScore}<span className="text-lg text-white/50">/100</span></div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Strongest Area</CardTitle>
            <Award className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-green-400 leading-tight">{topCategory}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 border-red-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Weakest Area</CardTitle>
            <Award className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-red-400 leading-tight">{bottomCategory}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart - Personal + Org Maturity */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Average Scores by Category</CardTitle>
            <CardDescription className="text-gray-300">
              {selectedCompany !== "all" ? selectedCompany : "All companies"} · {filtered.length} respondent{filtered.length !== 1 ? "s" : ""}
              {hasOrgData && " · Personal vs Org Maturity"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#ffffff20" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#ffffff60", fontSize: 10 }} />
                  <Radar name="Personal Avg" dataKey="Personal Avg" stroke="#D6FF00" fill="#D6FF00" fillOpacity={0.3} strokeWidth={2} />
                  {hasOrgData && (
                    <Radar name="Org Maturity Avg" dataKey="Org Maturity Avg" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 4" />
                  )}
                  <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #ffffff20" }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-white/40 text-center py-16">No data for selected filters</div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Bar Chart */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Score Distribution</CardTitle>
            <CardDescription className="text-gray-300">Number of respondents per rank band</CardDescription>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#ffffff80" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#ffffff80" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #ffffff20" }} />
                  <Bar dataKey="count" name="Respondents" radius={[4, 4, 0, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-white/40 text-center py-16">No data for selected filters</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Companies Comparison Radar */}
      {comparisonData && comparisonData.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Selected Companies Comparison</CardTitle>
            <CardDescription className="text-gray-300">
              Personal scores (solid) vs Org Maturity (dashed) for {comparisonData.length} selected compan{comparisonData.length === 1 ? "y" : "ies"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart
                data={CANONICAL_CATEGORIES.map((cat) => ({
                  category: cat.length > 20 ? cat.split(" ").slice(0, 2).join(" ") : cat,
                  ...Object.fromEntries(comparisonData.flatMap((cd, i) => [
                    [`${cd.company} (Personal)`, cd.categories.find(c => c.category === cat)?.personal || 0],
                    ...(cd.categories.find(c => c.category === cat)?.hasOrg ? [[`${cd.company} (Org)`, cd.categories.find(c => c.category === cat)?.org || 0]] : []),
                  ])),
                }))}
                cx="50%" cy="50%" outerRadius="70%"
              >
                <PolarGrid stroke="#ffffff20" />
                <PolarAngleAxis dataKey="category" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#ffffff60", fontSize: 10 }} />
                {comparisonData.map((cd, i) => (
                  <Radar key={`personal-${i}`} name={`${cd.company} (Personal)`} dataKey={`${cd.company} (Personal)`} stroke={COMPARISON_COLORS[i % COMPARISON_COLORS.length]} fill={COMPARISON_COLORS[i % COMPARISON_COLORS.length]} fillOpacity={0.1} strokeWidth={2} />
                ))}
                {comparisonData.map((cd, i) => {
                  const hasOrg = cd.categories.some(c => c.hasOrg);
                  if (!hasOrg) return null;
                  return (
                    <Radar key={`org-${i}`} name={`${cd.company} (Org)`} dataKey={`${cd.company} (Org)`} stroke={COMPARISON_COLORS[i % COMPARISON_COLORS.length]} fill={COMPARISON_COLORS[i % COMPARISON_COLORS.length]} fillOpacity={0.05} strokeWidth={2} strokeDasharray="4 4" />
                  );
                })}
                <Legend wrapperStyle={{ color: "#fff", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #ffffff20" }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Companies Overview with Checkboxes */}
      {selectedCompany === "all" && companies.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Companies Overview
              </CardTitle>
              <div className="flex items-center gap-3">
                {selectedCompanies.size > 0 && (
                  <span className="text-xs text-white/50">{selectedCompanies.size} selected</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllCompanies}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
                >
                  {selectedCompanies.size === companies.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies.map((company) => {
                const companyResults = results.filter((r) => r.company_name === company);
                const companyAvg = Math.round(companyResults.reduce((s, r) => s + r.overall_score, 0) / companyResults.length);
                const hasOrgScores = companyResults.some((r) => r.org_maturity_scores && Array.isArray(r.org_maturity_scores));
                return (
                  <div
                    key={company}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCompanies.has(company) ? "bg-white/15 ring-1 ring-white/30" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCompanies.has(company)}
                        onCheckedChange={() => toggleCompanySelection(company)}
                        className="border-white/40 data-[state=checked]:bg-[#D6FF00] data-[state=checked]:border-[#D6FF00] data-[state=checked]:text-black"
                      />
                      <Building2 className="h-4 w-4 text-white/40" />
                      <span
                        className="text-white font-medium cursor-pointer hover:underline"
                        onClick={() => setSelectedCompany(company)}
                      >
                        {company}
                      </span>
                      <span className="text-white/40 text-sm">({companyResults.length} respondent{companyResults.length !== 1 ? "s" : ""})</span>
                      {hasOrgScores && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Org Data</span>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      companyAvg >= 85 ? "bg-green-500/20 text-green-300" :
                      companyAvg >= 70 ? "bg-blue-500/20 text-blue-300" :
                      companyAvg >= 55 ? "bg-yellow-500/20 text-yellow-300" :
                      companyAvg >= 35 ? "bg-orange-500/20 text-orange-300" :
                      "bg-red-500/20 text-red-300"
                    }`}>
                      Avg: {companyAvg}/100
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
