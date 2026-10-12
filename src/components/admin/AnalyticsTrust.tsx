import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type Range = "7days" | "30days" | "alltime";

interface Daily { day: string; visits: number; purchases: number; leads: number }
interface Summary {
  window: { since: string; until: string };
  visits: number;
  page_views: number;
  checkout_click_sessions: number;
  checkout_clicks: number;
  checkout_visits: number;
  purchases: number;
  revenue_gbp: number;
  leads: number;
  leads_by_source: Record<string, number>;
  clicks_without_link: number;
  last_page_view_at: string | null;
  last_click_at: string | null;
  daily: Daily[];
}

const RANGE_LABEL: Record<Range, string> = { "7days": "last 7 days", "30days": "last 30 days", alltime: "all time" };
const sinceFor = (r: Range) => {
  const d = new Date();
  if (r === "7days") d.setDate(d.getDate() - 7);
  else if (r === "30days") d.setDate(d.getDate() - 30);
  else return "2020-01-01T00:00:00Z";
  return d.toISOString();
};
const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—");
const ago = (iso: string | null) => {
  if (!iso) return "never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 48) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} days ago`;
};

/** Trusted numbers for the admin: computed in the database (admin_analytics_summary), with the definitions shown. */
export function AnalyticsTrust({ range }: { range: Range }) {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .rpc("admin_analytics_summary", { _since: sinceFor(range), _until: new Date().toISOString() })
      .then(({ data: d, error: e }) => {
        if (cancelled) return;
        if (e) setError(e.message);
        else setData(d as unknown as Summary);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [range]);

  if (loading) return <div className="text-sm text-slate-500 py-6">Loading verified numbers…</div>;
  if (error || !data) return <div className="text-sm text-red-600 py-6">Could not load the numbers: {error ?? "no data"}</div>;

  const hoursSinceView = data.last_page_view_at ? (Date.now() - new Date(data.last_page_view_at).getTime()) / 3600000 : Infinity;
  const brokenClicks = data.checkout_clicks + data.clicks_without_link;
  const warnings: string[] = [];
  if (hoursSinceView > 6) warnings.push(`No visits recorded for ${ago(data.last_page_view_at)}. Check that tracking is running.`);
  const linkless = pct(data.clicks_without_link, brokenClicks);
  if (data.clicks_without_link > 0 && data.clicks_without_link / Math.max(brokenClicks, 1) > 0.2) {
    warnings.push(`${linkless} of recorded clicks have no link attached (buttons not tagged), so click counts are understated.`);
  }
  const maxVisits = Math.max(1, ...data.daily.map((d) => d.visits));

  const kpis = [
    { label: "Visits", value: data.visits, note: "Sessions that loaded a page, excluding admin use" },
    { label: "Page views", value: data.page_views, note: "Every page load in those sessions" },
    { label: "Checkout clicks", value: data.checkout_click_sessions, note: "Sessions that clicked a checkout link" },
    { label: "Purchases", value: data.purchases, note: `Paid course purchases, ${RANGE_LABEL[range]}` },
    { label: "Revenue", value: `£${Number(data.revenue_gbp).toLocaleString("en-GB", { maximumFractionDigits: 2 })}`, note: "Sum of paid purchases (before VAT and fees)" },
    { label: "Leads", value: data.leads, note: "New leads from any form" },
  ];

  const funnel = [
    { label: "Visits", value: data.visits },
    { label: "Checkout clicks", value: data.checkout_click_sessions },
    { label: "Checkout page", value: data.checkout_visits },
    { label: "Purchases", value: data.purchases },
  ];

  const sources = Object.entries(data.leads_by_source).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Verified numbers ({RANGE_LABEL[range]})</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Last visit recorded {ago(data.last_page_view_at)} · last click {ago(data.last_click_at)}
        </span>
      </div>

      {warnings.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 size={16} /> Tracking is running and the numbers below come straight from the database.
        </div>
      ) : (
        warnings.map((w) => (
          <div key={w} className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950 px-4 py-2 text-sm text-amber-900 dark:text-amber-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {w}
          </div>
        ))
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{k.label}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{typeof k.value === "number" ? k.value.toLocaleString() : k.value}</div>
              <div className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">{k.note}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-white dark:bg-slate-900 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-50">Offer funnel</CardTitle>
            <CardDescription>Each step as a share of the step before. Purchases are not linked to a visit yet, so that step is a count only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map((f, i) => (
              <div key={f.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{f.label}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    {f.value.toLocaleString()}{i > 0 && <span className="ml-2 text-xs font-normal text-slate-500">{pct(f.value, funnel[i - 1].value)} of previous</span>}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded bg-slate-100 dark:bg-slate-800">
                  <div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, (f.value / Math.max(1, funnel[0].value)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-50">Leads by source</CardTitle>
            <CardDescription>Where new leads came from in this period.</CardDescription>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <p className="text-sm text-slate-500">No new leads in this period.</p>
            ) : (
              <ul className="space-y-2">
                {sources.map(([name, n]) => (
                  <li key={name} className="flex justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300">{name}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-50">Visits per day</CardTitle>
            <CardDescription>UTC days, last 90 days at most.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-1">
              {data.daily.map((d) => (
                <div key={d.day} className="group relative flex-1">
                  <div className="rounded-t bg-primary/80" style={{ height: `${(d.visits / maxVisits) * 100}%`, minHeight: d.visits ? 2 : 0 }} />
                  <div className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white group-hover:block">
                    {d.day}: {d.visits} visits, {d.leads} leads, {d.purchases} purchases
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <details className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        <summary className="cursor-pointer font-semibold text-slate-900 dark:text-slate-50">How these numbers are counted</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Visits: sessions that loaded at least one page. Sessions that used /admin are left out.</li>
          <li>Checkout clicks: clicks on a link that goes to /student/checkout. A click on a button with no link is not counted here.</li>
          <li>Purchases and revenue: paid rows in course purchases in the period. Stripe is the record for payments.</li>
          <li>Leads: rows in the leads table created in the period, grouped by the form they came from.</li>
        </ul>
      </details>
    </div>
  );
}
