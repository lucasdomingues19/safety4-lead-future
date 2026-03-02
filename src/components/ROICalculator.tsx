import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calculator, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CALENDLY_LINK = "https://calendly.com/lucas-getshield360/30min";

function money(n: number): string {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "$" + Math.round(n / 1000) + "k";
  return "$" + Math.round(n).toLocaleString();
}

function AnimNum({ target, active, isHrs }: { target: number; active: boolean; isHrs?: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    let start: number | null = null;
    let raf: number;
    function tick(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  if (isHrs) return <span>{val >= 1000 ? (val / 1000).toFixed(1) + "k hrs" : val + " hrs"}</span>;
  return <span>{money(val)}</span>;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: (v: number) => string;
  hint?: string;
}

function CustomSlider({ label, value, min, max, step, onChange, display, hint }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</span>
        <span className="text-lg font-black text-white">{display(value)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-border overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-[-5px] left-0 w-full h-[16px] opacity-0 cursor-pointer"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground/60 mt-2 italic">{hint}</p>}
    </div>
  );
}

export function ROICalculator() {
  const [step, setStep] = useState(0);
  const [anim, setAnim] = useState(false);
  const [team, setTeam] = useState(8);
  const [sal, setSal] = useState(75000);
  const [manHrs, setManHrs] = useState(14);
  const [lti, setLti] = useState(8);
  const [fatal, setFatal] = useState(0);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  // Calculations — all benchmarks sourced, do not modify
  const hourly = sal / 52 / 37.5;
  const annHrs = Math.round(team * manHrs * 0.25 * 48);
  const timeSav = Math.round(annHrs * hourly);
  const ltiAv = Math.round(lti * 0.25);
  const fatAv = Math.round(fatal * 0.25);
  const ltiSav = ltiAv * 43000;    // NSC Injury Facts 2023
  const fatSav = fatAv * 1460000;   // NSC Injury Facts 2023
  const total = timeSav + ltiSav + fatSav;
  const cost = team <= 5 ? 6500 : team <= 10 ? 10500 : team <= 20 ? 18500 : 25000;
  const net = total - cost;
  const roi = Math.round((net / cost) * 100);
  const payback = total > 0 ? Math.round(cost / (total / 52)) : 0;

  const submit = useCallback(async () => {
    if (!name.trim() || !email.trim()) return;
    setSending(true);
    try {
      await supabase.from("leads").insert({
        name: name.trim(),
        email: email.trim(),
        job_title: jobTitle.trim() || null,
        role: company.trim() || null,
        source: "roi-calculator",
        message: `Team: ${team}, Salary: $${sal}, LTIs: ${lti}, Fatalities: ${fatal}, Total value: ${money(total)}, ROI: ${roi}%, Payback: ${payback} weeks`,
      });
    } catch (e) {
      // non-blocking
    }
    setStep(7);
    setSending(false);
  }, [name, email, jobTitle, company, team, sal, lti, fatal, total, roi, payback]);

  const stepLabels = ["Your team", "Manual hours", "LT injuries", "Fatalities"];

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border flex items-center gap-3">
          <Calculator className="w-5 h-5 text-primary" />
          <div>
            <div className="text-[10px] tracking-[3px] text-primary font-bold">SAFETY 4.0 ACADEMY</div>
            <div className="text-lg font-black text-white -mt-0.5">ROI CALCULATOR</div>
          </div>
        </div>

        {/* Step indicator */}
        {step >= 1 && step <= 4 && (
          <div className="px-6 pt-4">
            <div className="flex gap-1.5 mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
            <div className="flex justify-between">
              {stepLabels.map((l, i) => (
                <span key={i} className={`text-[10px] ${step >= i + 1 ? "text-muted-foreground" : "text-muted-foreground/30"}`}>{l}</span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* STEP 0 — INTRO */}
          {step === 0 && (
            <div className="text-center">
              <h3 className="font-syne text-xl md:text-2xl font-black text-white mb-3">
                What is the ROI of AI for your safety team?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Calculate the true cost of your injuries and fatalities, then model what AI could prevent. Benchmarks from NSC Injury Facts 2023.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: "🩹", title: "Cost per LTI", val: "$43,000", color: "text-amber-500" },
                  { icon: "⚠️", title: "Cost per fatality", val: "$1.46M", color: "text-red-500" },
                  { icon: "⏱️", title: "AI time recovery", val: "25%", color: "text-primary" },
                ].map((item) => (
                  <div key={item.title} className="bg-background/50 border border-border rounded-xl p-3 text-center">
                    <div className="text-lg mb-1">{item.icon}</div>
                    <div className="text-[10px] text-muted-foreground mb-1">{item.title}</div>
                    <div className={`text-sm font-black ${item.color}`}>{item.val}</div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep(1)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl">
                Calculate my ROI <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-[11px] text-muted-foreground/50 mt-3">4 steps · No sign-up to see results</p>
            </div>
          )}

          {/* STEP 1 — TEAM */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">STEP 1 OF 4</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Your Safety Team</h3>
                <p className="text-xs text-muted-foreground">Tell us about your EHS function</p>
              </div>
              <CustomSlider label="Team size" value={team} min={2} max={50} step={1} onChange={setTeam} display={(v) => v + " people"} hint="Include EHS managers, advisors, coordinators" />
              <CustomSlider label="Average annual salary" value={sal} min={30000} max={200000} step={5000} onChange={setSal} display={(v) => "$" + v.toLocaleString()} hint="US average EHS Manager: $70k–$100k (BLS 2024)" />
              <div className="bg-background/50 border border-border rounded-xl p-4 mt-2">
                <div className="text-xs text-muted-foreground">Annual team salary cost</div>
                <div className="text-xl font-black text-white">${(team * sal).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* STEP 2 — MANUAL HOURS */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">STEP 2 OF 4</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Manual EHS Task Hours</h3>
                <p className="text-xs text-muted-foreground">Hours per person per week on manual tasks</p>
              </div>
              <CustomSlider label="Manual hours per person" value={manHrs} min={2} max={30} step={1} onChange={setManHrs} display={(v) => v + " hrs/week"} hint="Incident reporting, audits, investigations, permits" />
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  McKinsey (2024) — organisations reclaim 20-30% of working hours with AI. We apply the <strong className="text-primary">25% midpoint</strong> to manual hours only.
                </p>
              </div>
              <div className="bg-background/50 border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">Hours recoverable per week (whole team)</div>
                <div className="text-xl font-black text-primary">{(team * manHrs * 0.25).toFixed(1)} hrs/week</div>
                <div className="text-xs text-muted-foreground mt-1">approx {annHrs.toLocaleString()} hrs per year — {money(timeSav)} salary value</div>
              </div>
            </div>
          )}

          {/* STEP 3 — LTIs */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">STEP 3 OF 4</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Lost-Time Injuries</h3>
                <p className="text-xs text-muted-foreground">OSHA recordable incidents with days away from work</p>
              </div>
              <CustomSlider label="LTIs per year" value={lti} min={0} max={50} step={1} onChange={setLti} display={(v) => v + " LTIs/yr"} hint="All OSHA recordable incidents with days-away-from-work" />
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] tracking-[2px] font-bold text-amber-500">NSC INJURY FACTS 2023</span>
                </div>
                <div className="text-sm font-bold text-amber-500">$43,000 per LTI</div>
              </div>
              <div className="bg-background/50 border border-border rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Annual LTI cost</span>
                  <span className="font-bold text-white">{money(lti * 43000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avoidable with AI</span>
                  <span className="font-bold text-amber-500">{ltiAv} incidents</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Potential saving</span>
                  <span className="font-bold text-primary">{money(ltiSav)}</span>
                </div>
              </div>
              <div className="bg-background/30 border border-border rounded-xl p-3 mt-3">
                <div className="text-[10px] tracking-[1px] font-bold text-muted-foreground/60 mb-0.5">UK REFERENCE — HSE 2023/24</div>
                <div className="text-[11px] text-muted-foreground/50">LTI cost to society: £44,300 — to employer: £7,500</div>
              </div>
            </div>
          )}

          {/* STEP 4 — FATALITIES */}
          {step === 4 && (
            <div>
              <div className="mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">STEP 4 OF 4</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Workplace Fatalities</h3>
                <p className="text-xs text-muted-foreground">Use a 3-year average across all sites</p>
              </div>
              <CustomSlider label="Fatalities per year" value={fatal} min={0} max={10} step={1} onChange={setFatal} display={(v) => v === 0 ? "None recorded" : v + " per year"} hint="3-year average is more reliable than single-year figures" />
              {fatal === 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                  <p className="text-xs text-muted-foreground">No fatalities recorded — shows as $0. LTI and time savings still included.</p>
                </div>
              )}
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4">
                <div className="text-[10px] tracking-[2px] font-bold text-red-500 mb-1">NSC INJURY FACTS 2023</div>
                <div className="text-sm font-bold text-red-500">$1,460,000 per fatality</div>
              </div>
              {fatal > 0 && (
                <div className="bg-background/50 border border-border rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual fatality cost</span>
                    <span className="font-bold text-white">{money(fatal * 1460000)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avoidable (25%)</span>
                    <span className="font-bold text-red-500">{fatAv}/yr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Potential saving</span>
                    <span className="font-bold text-primary">{money(fatSav)}</span>
                  </div>
                </div>
              )}
              <div className="bg-background/30 border border-border rounded-xl p-3 mt-3">
                <div className="text-[10px] tracking-[1px] font-bold text-muted-foreground/60 mb-0.5">UK REFERENCE — HSE 2023/24</div>
                <div className="text-[11px] text-muted-foreground/50">Fatality cost to society: £2,185,000 — to employer: £111,000</div>
              </div>
            </div>
          )}

          {/* STEP 5 — RESULTS */}
          {step === 5 && (
            <div>
              <div className="text-center mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">YOUR RESULTS</div>
                <h3 className="font-syne text-xl md:text-2xl font-black text-white mb-2">
                  AI could unlock <span className="text-primary"><AnimNum target={total} active={anim} /></span> in year one
                </h3>
                <p className="text-xs text-muted-foreground">
                  {team} people · ${sal.toLocaleString()} avg · {lti} LTIs{fatal > 0 ? ` · ${fatal} fatalities` : ""}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { val: timeSav, label: "Time savings (McKinsey 25%)", color: "text-primary" },
                  { val: ltiSav, label: `${ltiAv} LTIs avoided × $43k`, color: "text-amber-500" },
                  { val: fatSav, label: `${fatAv} fatalities avoided × $1.46M`, color: "text-red-500" },
                  { val: annHrs, label: "Hours recovered per year", color: "text-purple-400", isHrs: true },
                ].map((item) => (
                  <div key={item.label} className="bg-background/50 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                    <div className={`text-lg font-black ${item.color}`}>
                      <AnimNum target={item.val} active={anim} isHrs={item.isHrs} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-background/50 border border-border rounded-xl p-4 mb-6">
                <div className="text-[10px] tracking-[2px] font-bold text-muted-foreground mb-3">FULL ROI BREAKDOWN</div>
                {[
                  { l: "Time savings", v: money(timeSav), c: "text-primary" },
                  { l: `LTI avoided (${ltiAv} × $43k)`, v: money(ltiSav), c: "text-amber-500" },
                  { l: `Fatalities avoided (${fatAv} × $1.46M)`, v: money(fatSav), c: "text-red-500" },
                  { l: "Total annual value", v: money(total), c: "text-white font-black" },
                  { l: "Programme investment", v: "$" + cost.toLocaleString(), c: "text-muted-foreground" },
                  { l: "Net return year one", v: money(net), c: net > 0 ? "text-primary" : "text-red-500" },
                  { l: "Return on investment", v: roi + "%", c: net > 0 ? "text-primary" : "text-red-500" },
                  { l: "Payback period", v: payback + " weeks", c: "text-white" },
                ].map((row) => (
                  <div key={row.l} className="flex justify-between py-1.5 border-b border-border last:border-0 text-sm">
                    <span className="text-muted-foreground">{row.l}</span>
                    <span className={`font-bold ${row.c}`}>{row.v}</span>
                  </div>
                ))}
              </div>

              <Button onClick={() => setStep(6)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl mb-2">
                Get my full ROI report
              </Button>
              <button
                onClick={() => { setAnim(false); setStep(1); }}
                className="w-full flex items-center justify-center gap-2 bg-transparent border border-border rounded-xl py-2.5 text-muted-foreground text-xs hover:border-primary/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Adjust my inputs
              </button>
            </div>
          )}

          {/* STEP 6 — LEAD CAPTURE */}
          {step === 6 && (
            <div>
              <div className="text-center mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">UNLOCK YOUR REPORT</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Get your personalised ROI report</h3>
                <p className="text-xs text-muted-foreground">Full breakdown + tailored proposal + free 20-min call with Lucas.</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Year one value</span>
                <span className="font-black text-primary">{money(total)} · {roi}% ROI</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Your name", val: name, setter: setName, placeholder: "First and last name", type: "text" },
                  { label: "Job title", val: jobTitle, setter: setJobTitle, placeholder: "e.g. HSSEQ Director", type: "text" },
                  { label: "Organisation", val: company, setter: setCompany, placeholder: "Company name", type: "text" },
                  { label: "Work email", val: email, setter: setEmail, placeholder: "your@company.com", type: "email" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                    <input
                      type={field.type}
                      value={field.val}
                      placeholder={field.placeholder}
                      onChange={(e) => field.setter(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={submit}
                disabled={sending || !name.trim() || !email.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl mt-5"
              >
                {sending ? "Sending..." : "Send me my ROI report"}
              </Button>
            </div>
          )}

          {/* STEP 7 — CONFIRMATION */}
          {step === 7 && (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-syne text-lg font-black text-white mb-2">Your ROI report is on its way</h3>
              <p className="text-sm text-muted-foreground mb-6">Check your inbox. We will be in touch within one business day.</p>
              <div className="bg-background/50 border border-border rounded-xl p-4 mb-6">
                {[
                  { l: "Team", v: team + " people" },
                  { l: "Time savings", v: money(timeSav) },
                  { l: "LTI avoided", v: money(ltiSav) },
                  { l: "Total value", v: money(total) },
                  { l: "ROI", v: roi + "%" },
                  { l: "Payback", v: payback + " weeks" },
                ].map((row) => (
                  <div key={row.l} className="flex justify-between py-1.5 border-b border-border last:border-0 text-sm">
                    <span className="text-muted-foreground">{row.l}</span>
                    <span className="font-bold text-white">{row.v}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Questions? <span className="text-primary">hello@safetyacademy.tech</span></p>
            </div>
          )}

          {/* Navigation buttons (steps 1-4) */}
          {step >= 1 && step <= 4 && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 bg-transparent border border-border rounded-xl px-4 py-2.5 text-muted-foreground text-xs hover:border-primary/40 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <Button
                onClick={() => {
                  if (step === 4) {
                    setStep(5);
                    setTimeout(() => setAnim(true), 300);
                  } else {
                    setStep((s) => s + 1);
                  }
                }}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl"
              >
                {step === 4 ? "Calculate my ROI" : "Next"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
