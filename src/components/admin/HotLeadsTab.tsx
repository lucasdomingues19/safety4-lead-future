import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Eye, Clock, Target, MapPin, Monitor, RefreshCw, TrendingUp, Zap, Mail, Calendar, Copy, MessageCircle, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { openWhatsAppBusiness, getWhatsAppLeadMessage, ZOOM_SCHEDULER_URL } from "@/lib/outreach";


interface LeadContact {
  name: string;
  email: string;
  phone: string | null;
  source: string;
  created_at: string;
}

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
  company: string | null;
  device: string | null;
  pages_visited: string[];
  is_converted: boolean;
  contact: LeadContact | null;
}

interface PageView {
  session_id: string;
  page_path: string;
  visited_at: string;
  country: string | null;
  city: string | null;
  company: string | null;
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

interface LeadRecord {
  name: string;
  email: string;
  phone: string | null;
  source: string;
  created_at: string;
}

export const HotLeadsTab = () => {
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [composeLead, setComposeLead] = useState<HotLead | null>(null);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);


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
          .select('session_id, page_path, visited_at, country, city, company, device_type, duration')
          .gte('visited_at', thirtyDaysAgo.toISOString())
          .order('visited_at', { ascending: false }),
        supabase
          .from('user_events')
          .select('session_id, event_type, event_data, page_path, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('leads')
          .select('name, email, phone, source, created_at'),
        supabase
          .from('scorecard_results')
          .select('email, overall_score, rank_label, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())
      ]);

      if (pageViewsResult.error) throw pageViewsResult.error;

      const pageViews = pageViewsResult.data as PageView[];
      const userEvents = (userEventsResult.data || []) as UserEvent[];
      const rawLeadsData = (leadsResult.data || []) as LeadRecord[];
      const scorecardCompletions = scorecardResult.data || [];

      // Match leads to sessions by time proximity (lead created during or shortly after a session)
      const findLeadForSession = (sessionStart: Date, sessionEnd: Date): LeadRecord | null => {
        const bufferEnd = new Date(sessionEnd.getTime() + 2 * 60 * 60 * 1000); // +2h buffer
        return (
          rawLeadsData.find((lead) => {
            const leadDate = new Date(lead.created_at);
            return leadDate >= sessionStart && leadDate <= bufferEnd;
          }) || null
        );
      };
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

        // Converted if a lead was submitted within this session's window
        const matchedLead = findLeadForSession(sessionStart, sessionEnd);
        const isConverted = !!matchedLead;

        // Only include sessions with meaningful engagement
        if (score >= 20) {
          const firstView = data.views[data.views.length - 1];

          scoredLeads.push({
            session_id,
            score,
            signals,
            page_views: pageViewCount,
            pricing_views: pricingIntent,
            assessment_completed: assessmentCompleted,
            scorecard_score: scorecardScore,
            scorecard_rank: scorecardRank,
            return_visits: returnVisits,
            total_time_minutes: totalMinutes,
            last_seen: data.lastSeen.toISOString(),
            country: firstView?.country,
            city: firstView?.city,
            company: data.views.map(v => v.company).find(c => c && c.length > 0) ?? null,
            device: firstView?.device_type,
            pages_visited: pagesVisited,
            is_converted: isConverted,
            contact: matchedLead
              ? {
                  name: matchedLead.name,
                  email: matchedLead.email,
                  phone: matchedLead.phone,
                  source: matchedLead.source,
                  created_at: matchedLead.created_at,
                }
              : null,
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

  const getOutreachContext = (lead: HotLead): string => {
    if (lead.assessment_completed && lead.scorecard_rank) {
      return `I saw you completed the Safety 4.0 Readiness Scorecard and ranked as "${lead.scorecard_rank}" (${lead.scorecard_score}%).`;
    }
    if (lead.pricing_views > 0) {
      return 'I noticed you were looking at our programmes and pricing.';
    }
    if (lead.pages_visited.some(p => p.includes('syllabus'))) {
      return 'I saw you checking out the syllabus and curriculum details.';
    }
    if (lead.pages_visited.some(p => p.includes('instructor'))) {
      return 'I noticed you were reading about the instructor and our approach.';
    }
    return 'I noticed you spent some time on the SafetyTech Academy site.';
  };

  const handleWhatsApp = async (lead: HotLead) => {
    if (!lead.contact?.phone) {
      toast.error('No phone number captured for this lead.');
      return;
    }
    const context = getOutreachContext(lead);
    const message = getWhatsAppLeadMessage(lead.contact.name, context);
    const result = await openWhatsAppBusiness(lead.contact.phone, message);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleEmail = (lead: HotLead) => {
    if (!lead.contact?.email) {
      toast.error('No email captured for this lead.');
      return;
    }
    const context = getOutreachContext(lead);
    setComposeLead(lead);
    setComposeSubject('SafetyTech Academy — following up on your visit');
    setComposeBody(
      `${getWhatsAppLeadMessage(lead.contact.name, context)}\n\nYou can also grab a slot in my diary here:\n${ZOOM_SCHEDULER_URL}\n\nBest regards,\nLucas Domingues\nSafetyTech Academy`
    );
  };

  const handleSendGmail = async () => {
    if (!composeLead?.contact?.email) return;
    if (!composeSubject.trim() || !composeBody.trim()) {
      toast.error('Subject and message are required.');
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-lead-gmail', {
        body: {
          to: composeLead.contact.email,
          subject: composeSubject.trim(),
          body: composeBody,
        },
      });
      if (error) {
        const details = error instanceof FunctionsHttpError
          ? await error.context.text()
          : error.message;
        console.error('send-lead-gmail failed:', details);
        toast.error('Could not send via Gmail. Check the function logs for details.');
        return;
      }
      if (data?.error) {
        toast.error(String(data.error));
        return;
      }
      toast.success(`Email sent from your Gmail to ${composeLead.contact.email}.`);
      setComposeLead(null);
    } finally {
      setSending(false);
    }
  };


  const handleCopyMessage = async (lead: HotLead) => {
    if (!lead.contact) {
      toast.error('No contact details to copy.');
      return;
    }
    const context = getOutreachContext(lead);
    const text = getWhatsAppLeadMessage(lead.contact.name, context);
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Outreach message copied to clipboard.');
    } catch {
      toast.error('Could not copy message.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 text-slate-900 animate-spin" />
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

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Total Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{hotLeads.length}</div>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Hot Leads List */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                Hot Leads Dashboard
              </CardTitle>
              <CardDescription className="text-slate-600">
                Anonymous visitors showing high purchase intent. Last updated: {lastRefresh.toLocaleTimeString()}
              </CardDescription>
            </div>
            <Button
              onClick={fetchHotLeads}
              variant="outline"
              className="bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hotLeads.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
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
                    className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Rank & Score */}
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-300">#{index + 1}</div>
                          <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium text-slate-900 ${heat.color}`}>
                            {lead.score}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`${heat.color} text-slate-900 border-0`}>
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
                                className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                              >
                                {signal}
                              </span>
                            ))}
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                            {lead.company && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/20 text-primary-foreground font-medium">
                                🏢 {lead.company}
                              </span>
                            )}
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

                          {/* Contact & Actions */}
                          {lead.contact ? (
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="font-medium text-slate-900">{lead.contact.name}</span>
                                <span className="text-slate-500">{lead.contact.email}</span>
                                {lead.contact.phone && (
                                  <span className="text-primary font-medium">{lead.contact.phone}</span>
                                )}
                                <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
                                  {lead.contact.source}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {lead.contact.phone ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleWhatsApp(lead)}
                                    className="bg-primary hover:bg-primary/90 text-white gap-1"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    WhatsApp
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    disabled
                                    variant="outline"
                                    className="border-slate-200 text-slate-400 gap-1"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    No WhatsApp
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => handleEmail(lead)}
                                  variant="outline"
                                  className="border-slate-200 text-slate-900 hover:bg-slate-100 gap-1"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                  Email via Gmail

                                </Button>
                                <a
                                  href={ZOOM_SCHEDULER_URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-200 text-slate-900 hover:bg-slate-100 gap-1"
                                  >
                                    <Calendar className="h-3.5 w-3.5" />
                                    Book Zoom
                                  </Button>
                                </a>
                                <Button
                                  size="sm"
                                  onClick={() => handleCopyMessage(lead)}
                                  variant="outline"
                                  className="border-slate-200 text-slate-900 hover:bg-slate-100 gap-1"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy message
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-3 border-t border-slate-100">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-xs text-slate-500">
                                  No contact captured — visitor is still anonymous.
                                </span>
                                <a
                                  href={ZOOM_SCHEDULER_URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-200 text-slate-900 hover:bg-slate-100 gap-1"
                                  >
                                    <Calendar className="h-3.5 w-3.5" />
                                    Share Zoom link
                                  </Button>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Last Seen */}
                      <div className="text-right">
                        <div className="text-sm text-slate-500">Last seen</div>
                        <div className="text-slate-900 font-medium">{formatTimeAgo(lead.last_seen)}</div>
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
      <Card className="bg-slate-50 backdrop-blur-lg border-slate-100">
        <CardHeader>
          <CardTitle className="text-slate-900 text-sm">Intent Scoring Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
            <div>
              <span className="font-medium text-primary">+35</span> Clicked enrollment
            </div>
            <div>
              <span className="font-medium text-primary">+30</span> Pricing 3+ times
            </div>
            <div>
              <span className="font-medium text-primary">+25</span> Completed assessment
            </div>
            <div>
              <span className="font-medium text-primary">+20</span> 3+ visit days
            </div>
            <div>
              <span className="font-medium text-primary">+15</span> Pricing 1-2 times
            </div>
            <div>
              <span className="font-medium text-primary">+15</span> 10+ min on site
            </div>
            <div>
              <span className="font-medium text-primary">+10</span> Deep scroll (75%+)
            </div>
            <div>
              <span className="font-medium text-primary">+10</span> Viewed syllabus
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!composeLead} onOpenChange={(open) => !open && setComposeLead(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email lead from Gmail</DialogTitle>
            <DialogDescription>
              Sends from your connected Gmail account to{" "}
              <span className="font-medium">{composeLead?.contact?.email}</span>. The message appears in your Gmail Sent folder, so replies come straight back to you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="gmail-subject">Subject</Label>
              <Input
                id="gmail-subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                maxLength={300}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gmail-body">Message</Label>
              <Textarea
                id="gmail-body"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                rows={10}
                maxLength={10000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeLead(null)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSendGmail} disabled={sending} className="gap-1">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending…" : "Send via Gmail"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

