import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calculator, RotateCcw, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateROIReport } from "@/utils/roiPdfReport";

function money(n: number): string {
  const a = Math.abs(n),s = n < 0 ? "-" : "";
  if (a >= 1000000) return s + "$" + (a / 1000000).toFixed(2) + "M";
  if (a >= 1000) return s + "$" + Math.round(a / 1000) + "k";
  return s + "$" + Math.round(a).toLocaleString();
}

function AnimNum({ target, active, isHrs }: {target: number;active: boolean;isHrs?: boolean;}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) {setVal(0);return;}
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
  const pct = (value - min) / (max - min) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</span>
        <span className="text-lg font-black text-white">{display(value)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-border overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
          style={{ width: `${pct}%` }} />
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-[-5px] left-0 w-full h-[16px] opacity-0 cursor-pointer" />
        
      </div>
      {hint && <p className="text-xs text-muted-foreground/60 mt-2 italic">{hint}</p>}
    </div>);

}

export function ROICalculator() {
  const [step, setStep] = useState(0);
  const [anim, setAnim] = useState(false);
  const [team, setTeam] = useState(8);
  const [sal, setSal] = useState(75000);
  const [manHrs, setManHrs] = useState(14);
  const [tri, setTri] = useState(20);
  const [fatal, setFatal] = useState(0);
  const [safetyToggle, setSafetyToggle] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [newsConsent, setNewsConsent] = useState(false);
  const [sending, setSending] = useState(false);

  // Calculations — all benchmarks sourced, do not modify
  const hourly = sal / 52 / 37.5;
  const annHrs = Math.round(team * manHrs * 0.25 * 48);
  const timeSav = Math.round(annHrs * hourly);
  const triAv = Math.round(tri * 0.25);
  const fatAv = Math.round(fatal * 0.25);
  const injSav = triAv * 43000; // NSC Injury Facts 2023
  const fatSav = fatAv * 1460000; // NSC Injury Facts 2023
  const safetySav = injSav + fatSav;

  const annualSav = timeSav + (safetyToggle ? safetySav : 0);
  const cost = team <= 5 ? 6500 : team <= 10 ? 10500 : team <= 20 ? 18500 : 25000;
  const y1 = annualSav - cost;
  const y2 = annualSav;
  const y3 = annualSav;
  const cum = y1 + y2 + y3;
  const roi1 = Math.round(y1 / cost * 100);
  const roi3 = Math.round(cum / cost * 100);
  const payback = annualSav > 0 ? Math.round(cost / (annualSav / 52)) : 0;
  const maxBar = Math.max(Math.abs(y1), y2, y3, 1);

  const submit = useCallback(async () => {
    if (!name.trim() || !email.trim()) return;
    setSending(true);
    try {
      generateROIReport({
        name: name.trim(),
        team, sal, manHrs, tri, fatal,
        timeSav, annHrs, injSav, fatSav, safetySav,
        annualSav, cost, y1, y2, y3, cum, roi1, roi3, payback,
        safetyToggle, triAv, fatAv, hourly,
      });
      await supabase.functions.invoke("capture-lead", {
        body: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          source: "roi_calculator",
          message: `ROI Calculator | Team: ${team}, Salary: $${sal}, TRI: ${tri}, Fatalities: ${fatal}, Annual value: ${money(annualSav)}, 3yr ROI: ${roi3}%, Payback: ${payback} weeks | Newsletter consent: ${newsConsent ? "Yes" : "No"}`
        }
      });
    } catch (e) {
      // non-blocking
    }
    setStep(7);
    setSending(false);
  }, [name, email, phone, newsConsent, team, sal, manHrs, tri, fatal, timeSav, annHrs, injSav, fatSav, safetySav, annualSav, cost, y1, y2, y3, cum, roi1, roi3, payback, safetyToggle, triAv, fatAv, hourly]);

  const stepLabels = ["Your team", "Manual hours", "Recordable injuries", "Fatalities"];

  function goResults() {setStep(5);setTimeout(() => setAnim(true), 300);}

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
        {step >= 1 && step <= 4 &&
        <div className="px-6 pt-4">
            <div className="flex gap-1.5 mb-2">
              {[1, 2, 3, 4].map((s) =>
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
            )}
            </div>
            <div className="flex justify-between">
              {stepLabels.map((l, i) =>
            <span key={i} className={`text-[10px] ${step >= i + 1 ? "text-muted-foreground" : "text-muted-foreground/30"}`}>{l}</span>
            )}
            </div>
          </div>
        }

        {/* Content */}
        <div className="p-6">
          {/* STEP 0 — INTRO */}
          {step === 0 &&
          <div className="text-center">
              <div className="inline-block bg-primary/10 text-primary text-[10px] tracking-[2px] font-bold px-3 py-1 rounded-full mb-4">FREE TOOL</div>
              <h3 className="font-syne text-xl md:text-2xl font-black text-white mb-3">
                What is the ROI of AI for your safety team?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Model the value of hours reclaimed from admin — and what your team could do with that time back on site. Benchmarks from NSC Injury Facts 2023, Harvard Business School, and UK HSE.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-background/50 border border-border rounded-xl p-3 text-center">
                  <div className="text-lg mb-1">⏱️</div>
                  <div className="text-[10px] text-muted-foreground mb-1">Time savings</div>
                  <div className="text-sm font-black text-primary">25% faster</div>
                  <div className="text-[9px] tracking-[1px] font-bold text-primary/60 mt-1">HARVARD/BCG 2023</div>
                </div>
                <div className="bg-background/50 border border-border rounded-xl p-3 text-center">
                  <div className="text-lg mb-1">🩹</div>
                  <div className="text-[10px] text-muted-foreground mb-1">Cost per recordable injury</div>
                  <div className="text-sm font-black text-amber-500">$43,000</div>
                  <div className="text-[9px] tracking-[1px] font-bold text-amber-500/60 mt-1">NSC 2023</div>
                </div>
                <div className="bg-background/50 border border-border rounded-xl p-3 text-center">
                  <div className="text-lg mb-1">⚠️</div>
                  <div className="text-[10px] text-muted-foreground mb-1">Cost per fatality</div>
                  <div className="text-sm font-black text-red-500">$1.46M</div>
                  <div className="text-[9px] tracking-[1px] font-bold text-red-500/60 mt-1">NSC 2023</div>
                </div>
              </div>
              <Button onClick={() => setStep(1)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl">
                Calculate my ROI <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-[11px] text-muted-foreground/50 mt-3">&nbsp;</p>
            </div>
          }

          {/* STEP 1 — TEAM */}
          {step === 1 &&
          <div>
              <div className="mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">STEP 1 OF 4</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Your Safety Team</h3>
                <p className="text-xs text-muted-foreground">Tell us about your EHS function</p>
              </div>
              <CustomSlider label="Number of safety professionals" value={team} min={1} max={50} step={1} onChange={setTeam} display={(v) => v + " people"} hint="Include EHS leadership, managers, advisors and coordinators" />
              <CustomSlider label="Average annual salary" value={sal} min={40000} max={150000} step={1000} onChange={setSal} display={(v) => "$" + v.toLocaleString()} hint="US average EHS Manager: $70k–$100k (BLS 2024)" />
              <div className="bg-background/50 border border-border rounded-xl p-4 mt-2">
                <div className="text-xs text-muted-foreground">Annual team salary cost</div>
                <div className="text-xl font-black text-white">${(team * sal).toLocaleString()}</div>
              </div>
            </div>
          }

          {/* STEP 2 — MANUAL HOURS */}
          {step === 2 &&
          <div>
              <div className="mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">STEP 2 OF 4</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Manual EHS Task Hours</h3>
                <p className="text-xs text-muted-foreground">Hours per person per week on manual admin tasks</p>
              </div>
              <CustomSlider label="Manual hours per person per week" value={manHrs} min={1} max={30} step={1} onChange={setManHrs} display={(v) => v + " hrs/week"} hint="Incident reporting, audit prep, investigations, permit management, compliance documentation" />
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Harvard / BCG RCT (2023) — 758 consultants using AI completed knowledge tasks <strong className="text-primary">25% faster</strong>. We apply this rate to manual EHS admin hours only.
                </p>
                <div className="text-[9px] tracking-[1px] font-bold text-primary/60 mt-2">HARVARD/BCG 2023</div>
              </div>
              <div className="bg-background/50 border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">Hours recoverable per week (whole team)</div>
                <div className="text-xl font-black text-primary">{(team * manHrs * 0.25).toFixed(1)} hrs/week</div>
                <div className="text-xs text-muted-foreground mt-1">{annHrs.toLocaleString()} hrs/year freed from admin — available for site presence, observation and intervention</div>
              </div>
            </div>
          }

          {/* STEP 3 — TOTAL RECORDABLE INJURIES */}
          {step === 3 &&
          <div>
              <div className="mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">STEP 3 OF 4</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Total Recordable Injuries</h3>
                <p className="text-xs text-muted-foreground">All OSHA recordable cases across all sites per year</p>
              </div>
              <CustomSlider label="Total recordable injuries per year" value={tri} min={0} max={100} step={1} onChange={setTri} display={(v) => v + " TRI/yr"} hint="Includes days away from work, restricted work, and medical treatment cases — not just LTIs" />
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
                <div className="text-[10px] tracking-[2px] font-bold text-amber-500 mb-1">NSC INJURY FACTS 2023</div>
                <div className="text-sm font-bold text-amber-500">$43,000 per recordable injury</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Per medically consulted work injury<br />Wage losses + medical + admin + employer costs</div>
              </div>
              <div className="bg-background/50 border border-border rounded-xl p-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your annual injury cost</span>
                  <span className="font-bold text-white">{money(tri * 43000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avoidable (25%)</span>
                  <span className="font-bold text-amber-500">{triAv} cases</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Potential saving</span>
                  <span className="font-bold text-primary">{money(injSav)}</span>
                </div>
              </div>

              {/* Why TRI explainer */}
              <div className="bg-background/30 border border-border rounded-xl p-4 mb-3">
                <div className="text-[10px] tracking-[1px] font-bold text-muted-foreground/60 mb-1">WHY TOTAL RECORDABLE INJURIES?</div>
                <div className="text-[11px] text-muted-foreground/50 leading-relaxed">The NSC $43,000 benchmark applies to all medically consulted injuries — not just lost-time cases. Using LTIs alone understates your true injury cost. OSHA Total Recordable Incident Rate (TRIR) captures the full picture.</div>
              </div>

              <div className="bg-background/30 border border-border rounded-xl p-3">
                <div className="text-[10px] tracking-[1px] font-bold text-muted-foreground/60 mb-0.5">UK REFERENCE — HSE 2023/24 (RIDDOR, 7+ days)</div>
                <div className="text-[11px] text-muted-foreground/50">Reportable injury (society): £44,300 — employer: £7,500</div>
              </div>
            </div>
          }

          {/* STEP 4 — FATALITIES */}
          {step === 4 &&
          <div>
              <div className="mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">STEP 4 OF 4</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Workplace Fatalities</h3>
                <p className="text-xs text-muted-foreground">Use a 3-year average across all sites</p>
              </div>
              <CustomSlider label="Fatalities per year (3-yr average)" value={fatal} min={0} max={10} step={1} onChange={setFatal} display={(v) => v === 0 ? "None recorded" : v + " per year"} hint="3-year average avoids distortion from single-year outliers" />
              {fatal === 0 &&
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                  <p className="text-xs text-muted-foreground">No fatalities recorded — shows as $0. Time savings still included in results.</p>
                </div>
            }
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4" style={{ opacity: fatal > 0 ? 1 : 0.5 }}>
                <div className="text-[10px] tracking-[2px] font-bold text-red-500 mb-1">NSC INJURY FACTS 2023</div>
                <div className="text-sm font-bold text-red-500">$1,460,000 per fatality</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Per work-related death — wage and productivity losses, medical, admin</div>
              </div>
              {fatal > 0 &&
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
            }
              <div className="bg-background/30 border border-border rounded-xl p-3 mt-3">
                <div className="text-[10px] tracking-[1px] font-bold text-muted-foreground/60 mb-0.5">UK REFERENCE — HSE 2023/24</div>
                <div className="text-[11px] text-muted-foreground/50">Fatality (society): £2,185,000 — employer: £111,000</div>
              </div>
            </div>
          }

          {/* STEP 5 — RESULTS */}
          {step === 5 &&
          <div>
              <div className="text-center mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">YOUR RESULTS</div>
                <h3 className="font-syne text-xl md:text-2xl font-black text-white mb-2">AI training could unlock $55k per year
                <span className="text-primary"><AnimNum target={annualSav} active={anim} /></span> per year
                </h3>
                <p className="text-xs text-muted-foreground">
                  {team} people · ${sal.toLocaleString()} avg · {tri} recordable injuries{fatal > 0 ? ` · ${fatal} fatalities` : ""}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  3-year cumulative: {money(cum)} · {roi3}% ROI
                </p>
              </div>

              {/* Top stat cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-background/50 border border-border rounded-xl p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Time savings (Harvard/BCG 25%)</div>
                  <div className="text-lg font-black text-primary">
                    <AnimNum target={timeSav} active={anim} />
                  </div>
                </div>
                <div className="bg-background/50 border border-border rounded-xl p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Hours freed from admin/year</div>
                  <div className="text-lg font-black text-purple-400">
                    <AnimNum target={annHrs} active={anim} isHrs />
                  </div>
                </div>
              </div>

              {/* Safety outcome toggle */}
              <div className={`border rounded-xl p-4 mb-4 transition-colors ${safetyToggle ? "bg-primary/5 border-primary/20" : "bg-background/50 border-border"}`}>
                <div className="flex items-start gap-3">
                  <button
                  onClick={() => setSafetyToggle(!safetyToggle)}
                  className={`mt-0.5 w-10 h-5 rounded-full flex-shrink-0 relative transition-colors cursor-pointer ${safetyToggle ? "bg-primary" : "bg-border"}`}>
                  
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${safetyToggle ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                  <div>
                    <div className="text-sm font-bold text-white">Model safety outcome value</div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                      If reinvested hours reduce incidents by 25%: +{money(safetySav)}/yr (NSC 2023 costs). Models proactive safety time — not a direct AI claim.
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety cards — visible only when toggle ON */}
              {safetyToggle &&
            <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in">
                  <div className="bg-background/50 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{triAv} recordable injuries prevented (25%)</div>
                    <div className="text-lg font-black text-amber-500">
                      <AnimNum target={injSav} active={anim} />
                    </div>
                  </div>
                  <div className="bg-background/50 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{fatAv} fatalities prevented (25%)</div>
                    <div className="text-lg font-black text-red-500">
                      <AnimNum target={fatSav} active={anim} />
                    </div>
                  </div>
                </div>
            }

              {/* 3-Year ROI Bar Chart */}
              <div className="bg-background/50 border border-border rounded-xl p-4 mb-4">
                <div className="text-[10px] tracking-[2px] font-bold text-muted-foreground mb-4">3-YEAR ROI — ONE-OFF INVESTMENT</div>
                <div className="flex items-end justify-center gap-6 h-32 mb-4">
                  {[
                { label: "Year 1", value: y1, note: "after investment" },
                { label: "Year 2", value: y2, note: "pure savings" },
                { label: "Year 3", value: y3, note: "pure savings" }].
                map((bar, i) => {
                  const height = maxBar > 0 ? Math.max(Math.abs(bar.value) / maxBar * 100, 4) : 4;
                  const isNeg = bar.value < 0;
                  return (
                    <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
                        <div className="text-sm font-bold text-white">{bar.label}</div>
                        <div
                        className={`w-full max-w-16 rounded-t-md transition-all ${isNeg ? "bg-red-500" : i === 0 ? "bg-secondary/60" : "bg-secondary"}`}
                        style={{ height: `${height}%` }} />
                      
                        <div className={`text-lg font-black ${isNeg ? "text-red-500" : "text-secondary"}`}>{money(bar.value)}</div>
                        <div className="text-[9px] text-muted-foreground/50">{bar.note}</div>
                      </div>);

                })}
                </div>
                {/* Breakdown table */}
                <div className="border-t border-border pt-3 space-y-0">
                  {[
                { l: `Year 1 (after $${cost.toLocaleString()} investment)`, v: money(y1), c: y1 >= 0 ? "text-primary" : "text-red-500" },
                { l: "Year 2 (zero additional cost)", v: money(y2), c: "text-primary" },
                { l: "Year 3 (zero additional cost)", v: money(y3), c: "text-primary" },
                { l: "3-year cumulative return", v: money(cum), c: "text-white font-black" },
                { l: "3-year ROI on investment", v: roi3 + "%", c: "text-primary" },
                { l: "Year 1 ROI", v: roi1 + "%", c: roi1 >= 0 ? "text-primary" : "text-red-500" },
                { l: "Payback period", v: payback + " weeks", c: "text-white" }].
                map((row) =>
                <div key={row.l} className="flex justify-between py-1.5 border-b border-border last:border-0 text-sm">
                      <span className="text-muted-foreground">{row.l}</span>
                      <span className={`font-bold ${row.c}`}>{row.v}</span>
                    </div>
                )}
                </div>
              </div>

              {/* Sources */}
              <div className="bg-background/30 border border-border rounded-xl p-4 mb-6 space-y-3">
                <div className="text-[10px] tracking-[2px] font-bold text-primary mb-2">SOURCES</div>
                <div className="text-[11px] text-muted-foreground/60 leading-relaxed space-y-2">
                  <div>
                    <strong className="text-muted-foreground">AI TIME SAVINGS — 25%</strong>
                    <p>Dell'Acqua, F. et al. (2023). "Navigating the Jagged Technological Frontier." Harvard Business School / BCG. Working Paper No. 24-013. RCT, 758 consultants — AI users completed knowledge tasks 25% faster.</p>
                    <p className="mt-1">Corroborated by: Noy and Zhang (2023). Experimental evidence on the productivity effects of generative AI. Science, 381, 187-192. MIT RCT, 453 professionals — 40% reduction in task time on professional writing tasks.</p>
                    <p className="mt-1">Applied to manual EHS admin tasks only. Not applied to site work, decision-making or relationship-based activities.</p>
                  </div>
                  {safetyToggle &&
                <>
                      <div>
                        <strong className="text-muted-foreground">RECORDABLE INJURY AND FATALITY COSTS</strong>
                        <p>National Safety Council. Injury Facts 2023. $43,000 per medically consulted work injury (all OSHA Total Recordable Incidents). $1,460,000 per work-related death. injuryfacts.nsc.org/work/costs/work-injury-costs/</p>
                        <p className="mt-1">UK reference (RIDDOR 7+ days): HSE Appraisal Values 2023/24. Injury: £44,300 society / £7,500 employer. Fatality: £2,185,000 society / £111,000 employer. hse.gov.uk/statistics/economics/eauappraisal.htm</p>
                      </div>
                      <div>
                        <strong className="text-muted-foreground">INCIDENT REDUCTION — 25%</strong>
                        <p>Deloitte EHS predictive analytics research via United Safety (2025). Modelled as outcome of reinvesting recovered hours in proactive safety — not a direct AI training claim.</p>
                      </div>
                    </>
                }
                  <p className="italic border-t border-border pt-2">
                    Direct savings modelled only. Unmodelled value: staff retention, regulatory fine avoidance, reputational protection, insurance impact, compliance risk reduction. All figures are estimates — not guarantees of outcome.
                  </p>
                </div>
              </div>

              <Button onClick={() => setStep(6)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl mb-2">
                Get my full ROI report <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
              onClick={() => {setAnim(false);setStep(1);}}
              className="w-full flex items-center justify-center gap-2 bg-transparent border border-border rounded-xl py-2.5 text-muted-foreground text-xs hover:border-primary/40 transition-colors cursor-pointer">
              
                <RotateCcw className="w-3 h-3" /> Adjust my inputs
              </button>
            </div>
          }

          {/* STEP 6 — LEAD CAPTURE */}
          {step === 6 &&
          <div>
              <div className="text-center mb-6">
                <div className="text-[10px] tracking-[2px] text-primary font-bold mb-1">DOWNLOAD YOUR REPORT</div>
                <h3 className="font-syne text-lg font-black text-white mb-1">Get your personalised ROI report</h3>
                <p className="text-xs text-muted-foreground">Branded PDF with 3-year breakdown, sources, and key figures.</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex justify-between items-center">
                <div>
                  <span className="text-xs text-muted-foreground">Year 1 ROI</span>
                  <div className={`font-black ${roi1 >= 0 ? "text-primary" : "text-red-500"}`}>{roi1}%</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">3-year cumulative</span>
                  <div className="font-black text-primary">{money(cum)}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Your name *</label>
                  <input type="text" value={name} placeholder="First and last name"
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Work email *</label>
                  <input type="email" value={email} placeholder="your@company.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone (optional)</label>
                  <input type="tel" value={phone} placeholder="+44 7700 900000"
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors" />
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer mt-4">
                  <input type="checkbox" checked={newsConsent}
                    onChange={(e) => setNewsConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-border accent-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I accept to receive occasional news from the Safety 4.0 Academy
                  </span>
                </label>
              </div>
              <Button onClick={submit} disabled={sending || !name.trim() || !email.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl mt-5">
                <Download className="w-4 h-4 mr-2" />
                {sending ? "Generating..." : "Download my ROI report"}
              </Button>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-3">Your data is used only to generate and send your report.</p>
            </div>
          }

          {/* STEP 7 — CONFIRMATION */}
          {step === 7 &&
          <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-syne text-lg font-black text-white mb-2">Your ROI report is on its way</h3>
              <p className="text-sm text-muted-foreground mb-6">Check your inbox. We will be in touch within one business day.</p>
              <div className="bg-background/50 border border-border rounded-xl p-4 mb-6">
                {[
              { l: "Team", v: team + " people" },
              { l: "Annual time savings", v: money(timeSav) },
              { l: "Total annual value", v: money(annualSav) },
              { l: "Year 1 ROI", v: roi1 + "%" },
              { l: "3-year return", v: money(cum) },
              { l: "3-year ROI", v: roi3 + "%" },
              { l: "Payback", v: payback + " weeks" }].
              map((row) =>
              <div key={row.l} className="flex justify-between py-1.5 border-b border-border last:border-0 text-sm">
                    <span className="text-muted-foreground">{row.l}</span>
                    <span className="font-bold text-white">{row.v}</span>
                  </div>
              )}
              </div>
              <p className="text-xs text-muted-foreground">Questions? <span className="text-primary">hello@safetyacademy.tech</span></p>
            </div>
          }

          {/* Navigation buttons (steps 1-4) */}
          {step >= 1 && step <= 4 &&
          <div className="flex gap-3 mt-6">
              <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 bg-transparent border border-border rounded-xl px-4 py-2.5 text-muted-foreground text-xs hover:border-primary/40 transition-colors cursor-pointer">
              
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <Button
              onClick={() => {if (step === 4) goResults();else setStep((s) => s + 1);}}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl">
              
                {step === 4 ? "Calculate my ROI →" : "Next"} {step < 4 && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          }
        </div>

      </div>
    </div>);

}