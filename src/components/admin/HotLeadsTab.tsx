import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Eye, Clock, Target, MapPin, Monitor, RefreshCw, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";

interface HotLead {
  session_id: string;
  score: number;
  signals: string[];
  page_views: number;
  pricing_views: number;
  assessment_completed: boolean;
  scorecard_score?: number;
  scorecard_rank?: string;
  return_visits: number;
  total_time_minutes: number;
  last_seen: string;
  country: string | null;
  city: string | null;
  device: string | null;
  pages_visited: string[];
  is_converted: boolean;
}

interface PageView {
  session_id: string;
  page_path: string;
  visited_at: string;
  country: string | null;
  city: string | null;
  device_type: string | null;
  duration: number | null;
}

interface UserEvent {
  session_id: string;
  event_type: string;
  event_data: any;
  page_path: string;
  created_at: string;
}

export const HotLeadsTab = () => {
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchHotLeads();
  }, []);

  const fetchHotLeads = async () => {
    setLoading(true);
    try {
      // Fetch page views from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [pageViewsResult, userEventsResult, leadsResult, scorecardResult] = await Promise.all([
        supabase
          .from('page_views')
          .select('session_id, page_path, visited_at, country, city, device_type, duration')
          .gte('visited_at', thirtyDaysAgo.toISOString())
          .order('visited_at', { ascending: false }),
        supabase
          .from('user_events')
          .select('session_id, event_type, event_data, page_path, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('leads')
          .select('email, created_at'),
        supabase
          .from('scorecard_results')
          .select('email, overall_score, rank_label, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())
      ]);

      if (pageViewsResult.error) throw pageViewsResult.error;
      
      const pageViews = pageViewsResult.data as PageView[];
      const userEvents = (userEventsResult.data || []) as UserEvent[];
      const leadsData = (leadsResult.data || []) as { email: string; created_at: string }[];
      const scorecardCompletions = scorecardResult.data || [];
      // Filter out admin sessions (sessions that accessed /admin page)
      const adminSessionIds = new Set(
        pageViews
          .filter(pv => pv.page_path === '/admin')
          .map(pv => pv.session_id)
      );

      const filteredPageViews = pageViews.filter(pv => !adminSessionIds.has(pv.session_id));
      const filteredUserEvents = userEvents.filter(e => !adminSessionIds.has(e.session_id));

      // Group by session
      const sessionMap = new Map<string, {
        views: PageView[];
        events: UserEvent[];
        firstSeen: Date;
        lastSeen: Date;
      }>();

      filteredPageViews.forEach(pv => {
        if (!sessionMap.has(pv.session_id)) {
          sessionMap.set(pv.session_id, {
            views: [],
            events: [],
            firstSeen: new Date(pv.visited_at),
            lastSeen: new Date(pv.visited_at)
          });
        }
        const session = sessionMap.get(pv.session_id)!;
        session.views.push(pv);
        const visitDate = new Date(pv.visited_at);
        if (visitDate < session.firstSeen) session.firstSeen = visitDate;
        if (visitDate > session.lastSeen) session.lastSeen = visitDate;
      });

      filteredUserEvents.forEach(event => {
        if (sessionMap.has(event.session_id)) {
          sessionMap.get(event.session_id)!.events.push(event);
        }
      });

      // Score each session
      const scoredLeads: HotLead[] = [];

      sessionMap.forEach((data, session_id) => {
        const signals: string[] = [];
        let score = 0;

        // Unique pages visited
        const uniquePages = new Set(data.views.map(v => v.page_path));
        const pagesVisited = Array.from(uniquePages);
        const pageViewCount = data.views.length;

        // Pricing page views (high intent) — includes anchor navigation & offer redirects
        const pricingViews = data.views.filter(v =>
          v.page_path.includes('pricing') ||
          v.page_path.includes('#pricing') ||
          v.page_path.includes('offer') ||
          v.page_path.includes('/elearning') ||
          v.page_path.includes('/enrol') ||
          v.page_path.includes('/accelerator')
        ).length;

        // Pricing intent via clicks (kajabi checkout, offer/enrol CTAs)
        const pricingClicks = data.events.filter(e => {
          if (e.event_type !== 'click') return false;
          const s = JSON.stringify(e.event_data || {}).toLowerCase();
          return s.includes('kajabi') || s.includes('checkout') ||
                 s.includes('mykajabi') || s.includes('/offers/') ||
                 s.includes('pricing') || s.includes('#pricing');
        }).length;

        const pricingIntent = pricingViews + pricingClicks;
        if (pricingIntent >= 3) {
          score += 30;
          signals.push(`Pricing intent ${pricingIntent}x`);
        } else if (pricingIntent >= 1) {
          score += 15;
          signals.push(`Pricing intent ${pricingIntent}x`);
        }

        // Assessment completion — match any scorecard submitted within session window
        // (scorecard page now tracks views, but also match via timeframe for robustness)
        const sessionStart = data.firstSeen;
        const sessionEnd = new Date(data.lastSeen.getTime() + 3600000); // +1hr buffer
        const visitedScorecardResults = pagesVisited.some(p => p.includes('/scorecard'));
        const matchingScorecard = scorecardCompletions.find(sc => {
          const scDate = new Date(sc.created_at);
          return scDate >= sessionStart && scDate <= sessionEnd;
        });

        const assessmentCompleted = !!matchingScorecard;
        const scorecardScore = matchingScorecard?.overall_score;
        const scorecardRank = matchingScorecard?.rank_label;

        if (assessmentCompleted) {
          score += 25;
          signals.push(`Completed assessment (${scorecardScore}% - ${scorecardRank})`);
        } else if (visitedScorecardResults) {
          score += 5;
          signals.push('Visited scorecard page');
        }

        // Syllabus / certification research intent
        const syllabusViews = data.views.filter(v =>
          v.page_path.includes('syllabus') ||
          v.page_path.includes('certification') ||
          v.page_path.includes('/elearning')
        ).length;
        if (syllabusViews > 0) {
          score += 10;
          signals.push('Researched syllabus');
        }

        // Instructor page (trust building)
        const instructorViews = data.views.filter(v => v.page_path.includes('instructor')).length;
        if (instructorViews > 0) {
          score += 5;
          signals.push('Viewed instructor');
        }

        // Return visits (multiple days)
        const visitDays = new Set(data.views.map(v => 
          new Date(v.visited_at).toDateString()
        ));
        const returnVisits = visitDays.size;
        if (returnVisits >= 3) {
          score += 20;
          signals.push(`${returnVisits} visit days`);
        } else if (returnVisits >= 2) {
          score += 10;
          signals.push('Return visitor');
        }

        // Scroll depth events
        const deepScrolls = data.events.filter(e => {
          if (e.event_type === 'scroll' && e.event_data) {
            const depth = e.event_data.scroll_depth || e.event_data.depth || 0;
            return depth >= 75;
          }
          return false;
        }).length;
        if (deepScrolls > 0) {
          score += 10;
          signals.push('Deep page engagement');
        }

        // Offer/enrollment clicks (highest intent)
        const offerClicks = data.events.filter(e => {
          if (e.event_type === 'click') {
            const eventStr = JSON.stringify(e.event_data || {}).toLowerCase();
            return eventStr.includes('offer') || 
                   eventStr.includes('enroll') || 
                   eventStr.includes('start learning') ||
                   eventStr.includes('founding') ||
                   eventStr.includes('join the safety') ||
                   eventStr.includes('join the academy');
          }
          return false;
        }).length;
        if (offerClicks > 0) {
          score += 35;
          signals.push(`Clicked enroll ${offerClicks}x`);
        }

        // Total time on site
        const totalDuration = data.views.reduce((sum, v) => sum + (v.duration || 0), 0);
        const totalMinutes = Math.round(totalDuration / 60);
        if (totalMinutes >= 10) {
          score += 15;
          signals.push(`${totalMinutes}min on site`);
        } else if (totalMinutes >= 5) {
          score += 8;
          signals.push(`${totalMinutes}min on site`);
        }

        // Multiple pages viewed (engaged browser)
        if (uniquePages.size >= 5) {
          score += 10;
          signals.push(`Viewed ${uniquePages.size} pages`);
        }

        // Only include sessions with meaningful engagement
        if (score >= 20) {
          const firstView = data.views[data.views.length - 1];
          
          scoredLeads.push({
            session_id,
            score,
            signals,
            page_views: pageViewCount,
            pricing_views: pricingViews,
            assessment_completed: assessmentCompleted,
            scorecard_score: scorecardScore,
            scorecard_rank: scorecardRank,
            return_visits: returnVisits,
            total_time_minutes: totalMinutes,
            last_seen: data.lastSeen.toISOString(),
            country: firstView?.country,
            city: firstView?.city,
            device: firstView?.device_type,
            pages_visited: pagesVisited,
            is_converted: false
          });
        }
      });

      // Sort by score descending
      scoredLeads.sort((a, b) => b.score - a.score);
      
      setHotLeads(scoredLeads.slice(0, 50)); // Top 50
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching hot leads:', error);
      toast.error('Failed to load hot leads data');
    } finally {
      setLoading(false);
    }
  };

  const getHeatLevel = (score: number): { label: string; color: string; icon: React.ReactNode } => {
    if (score >= 80) return { label: 'On Fire', color: 'bg-red-500', icon: <Flame className="h-4 w-4" /> };
    if (score >= 60) return { label: 'Hot', color: 'bg-orange-500', icon: <Flame className="h-4 w-4" /> };
    if (score >= 40) return { label: 'Warm', color: 'bg-yellow-500', icon: <TrendingUp className="h-4 w-4" /> };
    return { label: 'Interested', color: 'bg-blue-500', icon: <Eye className="h-4 w-4" /> };
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  const onFireCount = hotLeads.filter(l => l.score >= 80).length;
  const hotCount = hotLeads.filter(l => l.score >= 60 && l.score < 80).length;
  const warmCount = hotLeads.filter(l => l.score >= 40 && l.score < 60).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-500/20 backdrop-blur-lg border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-200 flex items-center gap-2">
              <Flame className="h-4 w-4" /> On Fire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{onFireCount}</div>
            <p className="text-xs text-red-200/60">Score 80+</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/20 backdrop-blur-lg border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-200 flex items-center gap-2">
              <Flame className="h-4 w-4" /> Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{hotCount}</div>
            <p className="text-xs text-orange-200/60">Score 60-79</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/20 backdrop-blur-lg border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Warm Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{warmCount}</div>
            <p className="text-xs text-yellow-200/60">Score 40-59</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
              <Zap className="h-4 w-4" /> Total Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{hotLeads.length}</div>
            <p className="text-xs text-white/60">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Hot Leads List */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                Hot Leads Dashboard
              </CardTitle>
              <CardDescription className="text-gray-300">
                Anonymous visitors showing high purchase intent. Last updated: {lastRefresh.toLocaleTimeString()}
              </CardDescription>
            </div>
            <Button
              onClick={fetchHotLeads}
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hotLeads.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No high-intent visitors detected yet.</p>
              <p className="text-sm">Visitors will appear here once they show buying signals.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hotLeads.map((lead, index) => {
                const heat = getHeatLevel(lead.score);
                return (
                  <div 
                    key={lead.session_id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Rank & Score */}
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white/30">#{index + 1}</div>
                          <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium text-white ${heat.color}`}>
                            {lead.score}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`${heat.color} text-white border-0`}>
                              {heat.icon}
                              <span className="ml-1">{heat.label}</span>
                            </Badge>
                            {lead.assessment_completed && (
                              <Badge className="bg-lime-500 text-black border-0">
                                <Target className="h-3 w-3 mr-1" />
                                Scorecard: {lead.scorecard_score}% ({lead.scorecard_rank})
                              </Badge>
                            )}
                          </div>

                          {/* Signals */}
                          <div className="flex flex-wrap gap-1">
                            {lead.signals.map((signal, i) => (
                              <span 
                                key={i}
                                className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/80"
                              >
                                {signal}
                              </span>
                            ))}
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lead.city && lead.country 
                                ? `${lead.city}, ${lead.country}` 
                                : lead.country || lead.city || 'Unknown location'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {lead.page_views} pages
                            </span>
                            {lead.total_time_minutes > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lead.total_time_minutes}min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Last Seen */}
                      <div className="text-right">
                        <div className="text-sm text-white/60">Last seen</div>
                        <div className="text-white font-medium">{formatTimeAgo(lead.last_seen)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scoring Guide */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Intent Scoring Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-white/70">
            <div>
              <span className="font-medium text-lime-400">+35</span> Clicked enrollment
            </div>
            <div>
              <span className="font-medium text-lime-400">+30</span> Pricing 3+ times
            </div>
            <div>
              <span className="font-medium text-lime-400">+25</span> Completed assessment
            </div>
            <div>
              <span className="font-medium text-lime-400">+20</span> 3+ visit days
            </div>
            <div>
              <span className="font-medium text-lime-400">+15</span> Pricing 1-2 times
            </div>
            <div>
              <span className="font-medium text-lime-400">+15</span> 10+ min on site
            </div>
            <div>
              <span className="font-medium text-lime-400">+10</span> Deep scroll (75%+)
            </div>
            <div>
              <span className="font-medium text-lime-400">+10</span> Viewed syllabus
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
