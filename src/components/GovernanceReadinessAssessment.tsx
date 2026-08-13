import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ZOOM_SCHEDULER_URL } from "@/lib/outreach";
import { countryCodes } from "@/data/countryCodes";
import GovernanceRadarChart from "@/components/GovernanceRadarChart";

const DOMAINS = ["Visibility", "Literacy", "Governance", "Assurance", "Records"] as const;

const QUESTIONS: { d: number; q: string; a: string[]; na?: string }[] = [
  {
    d: 0,
    q: "Do you have a current list of the AI tools in use across your function, including anything embedded in software you already licence?",
    a: ["No list exists", "We could assemble one, roughly", "A list exists but is not maintained", "Maintained list, reviewed periodically", "Maintained, owned, reviewed on a schedule"],
  },
  {
    d: 0,
    q: "Was there a decision point where AI use in your function was approved?",
    a: ["No, it arrived through the tools we already had", "Informally, by individual managers", "Approved verbally at function level", "Approved and minuted", "Approved, minuted, with defined scope and limits"],
  },
  {
    d: 1,
    q: "Of the people using AI tools in their work, how many have had formal training on using them safely?",
    a: ["None", "A handful, self-taught", "Some, informally briefed", "Most, with a documented session", "All, with assessed and recorded training"],
  },
  {
    d: 1,
    q: "If asked today for a list of those people with training dates and evidence, how long would it take you?",
    a: ["We could not produce it", "Weeks, assembled from scratch", "Several days of digging", "A day or two", "Immediately, it is on file"],
  },
  {
    d: 1,
    q: "EU AI Act Article 4 requires organisations deploying AI systems to ensure a sufficient level of AI literacy among staff. Where do you stand against that obligation?",
    a: [
      "We were not aware of Article 4",
      "Aware of it, nothing done yet",
      "Reviewed it, an action plan is forming",
      "Training delivered, mapped to the obligation informally",
      "Training delivered, mapped and evidenced against Article 4",
    ],
    na: "Not applicable — we have no EU exposure",
  },
  {
    d: 2,
    q: "Is there a written policy covering AI use in your function, with a named owner?",
    a: ["No policy", "Drafting has been discussed", "Draft exists, not issued", "Issued policy, no named owner", "Issued, owned, with a review date"],
  },
  {
    d: 2,
    q: "Are AI tools assessed before they are adopted — data handling, supplier terms, and where the output is allowed to be used?",
    a: ["No assessment at all", "Ad hoc, by whoever adopts the tool", "Informal checks, not written down", "A check is done and noted", "A documented assessment before adoption, every time"],
  },
  {
    d: 3,
    q: "When AI drafts something feeding a safety decision — a risk assessment, an incident report, a method statement — who reviews it before it is relied on, and is that review recorded?",
    a: ["No defined review", "Whoever is available, not recorded", "A competent person reviews, not recorded", "Competent review, recorded inconsistently", "Competent review, recorded every time"],
  },
  {
    d: 4,
    q: "If your insurer or a regulator asked next month for evidence that AI-assisted safety decisions were competently supervised, what would you send?",
    a: ["Nothing, we would have to build it", "An explanation, no documents", "Partial records across systems", "A pack we would need to assemble", "A standing evidence pack, current"],
  },
  {
    d: 4,
    q: "Has anyone above you — board, executive, insurer, client — asked about your AI position yet?",
    a: ["No, and we have nothing ready", "No, and we would struggle to answer", "Informally, we answered loosely", "Yes, we answered with some evidence", "Yes, we answered with a documented position"],
  },
];

const BANDS = [
  { max: 5, name: "Exposed", tone: "text-red-600", desc: "There is no defensible position on AI use in your function. This would not survive a board question, an insurer enquiry, or a client audit. The gap is not unusual and it is not a reflection of carelessness. AI arrived through software you already owned rather than through procurement, which is exactly why nothing was documented." },
  { max: 10, name: "Developing", tone: "text-amber-600", desc: "You know AI is in use and you recognise the obligation, but you cannot currently evidence it. Awareness is not the gap. Records are. This is the most common position among the safety functions we assess." },
  { max: 15, name: "Structured", tone: "text-primary", desc: "A framework exists. The gaps are in coverage and currency rather than in principle. The work from here is narrower: closing specific domains and keeping records live rather than building from nothing." },
  { max: 20, name: "Assured", tone: "text-emerald-600", desc: "You hold a defensible position across all five domains. The task is maintenance: keeping training current as people join and move, and reviewing as the tools and the regulation change." },
];

const REMEDY: Record<number, { t: string; w: string }> = {
  0: { t: "Build an AI tool register for your function", w: "One page listing every tool in use, who uses it, and for what. Include what is embedded in software you already licence, which is where most of it hides." },
  1: { t: "Establish and evidence AI literacy across your users", w: "The obligation asks you to show the people using AI systems are competent to. Certificated training with a completion register is the evidence." },
  2: { t: "Issue a written AI use policy with a named owner", w: "Two pages is enough. Scope, permitted uses, prohibited uses, review requirement, owner, review date." },
  3: { t: "Define who reviews AI output before it is relied on", w: "AI drafts, a competent person reviews and underwrites. Write down who, for which outputs, and record the review." },
  4: { t: "Assemble a standing evidence pack", w: "Register, policy, training records, review logs. Kept current so the answer to an insurer or regulator is a document, not a project." },
};

const SEAT_OPTIONS: [number, string][] = [
  [1, "Just me"],
  [5, "2 to 9"],
  [15, "10 to 24"],
  [35, "25 to 49"],
  [75, "50 or more"],
];

const eyebrow = "font-mono text-[11px] uppercase tracking-[0.16em]";

type Stage = "questions" | "seats" | "gate" | "results";

export const GovernanceReadinessAssessment = ({ compact = false }: { compact?: boolean }) => {
  const [stage, setStage] = useState<Stage>("questions");
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [aiUsers, setAiUsers] = useState(0);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", company: "", role: "" });
  const [dialCode, setDialCode] = useState("+44");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const domainScores = useMemo(
    () =>
      DOMAINS.map((_, d) => {
        // -1 marks a "not applicable" answer: excluded from the domain average.
        const vals = QUESTIONS.map((q, i) => (q.d === d ? (scores[i] ?? 0) : null)).filter(
          (v): v is number => v !== null && v >= 0,
        );
        if (!vals.length) return 0;
        return vals.reduce((s, v) => s + v, 0) / vals.length;
      }),
    [scores],
  );

  const total = domainScores.reduce((a, b) => a + b, 0);
  const band = BANDS.find((b) => total <= b.max) ?? BANDS[BANDS.length - 1];
  const weakest = domainScores.map((s, i) => ({ s, i })).sort((a, b) => a.s - b.s).slice(0, 3);

  const answer = (value: number) => {
    const next = [...scores];
    next[step] = value;
    setScores(next);
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else setStage("seats");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!lead.name.trim()) return setError("Please add your name.");
    if (!lead.email.includes("@") || !lead.email.includes(".")) return setError("Please add a valid work email.");
    if (lead.phone.replace(/\D/g, "").length < 7) return setError("Please add a contact phone number.");
    const fullPhone = `${dialCode} ${lead.phone.trim()}`;

    setSubmitting(true);
    const ds = DOMAINS.map((d, i) => `${d} ${domainScores[i].toFixed(1)}/4`).join(", ");
    try {
      const { error: captureError } = await supabase.functions.invoke("capture-lead", {
        body: {
          name: lead.name.trim(),
          email: lead.email.trim(),
          phone: fullPhone,
          source: "governance_readiness",
          job_title: lead.role.trim() || null,
          inquiry_type: "AI Governance Readiness Review",
          message: `AI Governance Readiness Review — ${band.name} (${total.toFixed(1)}/20). Company: ${lead.company.trim() || "n/a"}. AI users: ${aiUsers}. Domains: ${ds}.`,
        },
      });
      if (captureError) console.error("Governance readiness lead capture failed:", captureError);
    } catch (err) {
      /* results still shown — capture failure must not block the user */
      console.error("Governance readiness lead capture failed:", err);
    }
    try {
      const { error: emailError } = await supabase.functions.invoke("send-governance-email", {
        body: {
          name: lead.name.trim(),
          email: lead.email.trim(),
          company: lead.company.trim() || null,
          bandName: band.name,
          bandDescription: band.desc,
          total: Number(total.toFixed(1)),
          domains: DOMAINS.map((d, i) => ({ domain: d, score: Number(domainScores[i].toFixed(1)) })),
          actions: weakest.map((w) => ({ title: REMEDY[w.i].t, why: REMEDY[w.i].w })),
        },
      });
      if (emailError) console.error("Governance readiness email failed:", emailError);
      else setEmailSent(true);
    } catch (err) {
      console.error("Governance readiness email failed:", err);
    }

    setSubmitting(false);
    setStage("results");
  };

  const activeDomain = QUESTIONS[Math.min(step, QUESTIONS.length - 1)].d;

  return (
    <div className={compact ? "" : "max-w-2xl mx-auto"}>
      {/* Domain tracker */}
      {stage !== "results" && (
        <div className="flex gap-1 sm:gap-1.5 mb-6 sm:mb-7">
          {DOMAINS.map((d, i) => (
            <div key={d} className="flex-1 min-w-0">
              <div className={`h-1 rounded-full ${i < activeDomain || stage !== "questions" ? "bg-primary" : "bg-slate-200"}`} />
              <span
                className={`${eyebrow} mt-1.5 block truncate text-[8px] sm:text-[9px] tracking-[0.08em] sm:tracking-[0.16em] ${i < activeDomain || stage !== "questions" ? "text-slate-900" : "text-slate-500"}`}
              >
                {d}
              </span>
            </div>
          ))}
        </div>
      )}

      {stage === "questions" && (
        <div>
          <div className={`${eyebrow} text-slate-500 mb-3`}>
            Question <span className="text-primary font-semibold">{step + 1}</span> of {QUESTIONS.length} · {DOMAINS[activeDomain]}
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug mb-6">{QUESTIONS[step].q}</h3>
          <div className="flex flex-col gap-2.5">
            {QUESTIONS[step].a.map((t, i) => (
              <button
                key={t}
                onClick={() => answer(i)}
                className="flex items-start gap-3.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary px-4 py-3.5 text-[15px] text-slate-900 transition-colors"
              >
                <span className="font-mono text-xs text-primary pt-0.5">{i}</span>
                <span>{t}</span>
              </button>
            ))}
            {QUESTIONS[step].na && (
              <button
                onClick={() => answer(-1)}
                className="flex items-start gap-3.5 text-left rounded-xl border border-dashed border-slate-300 bg-transparent hover:bg-slate-100 hover:border-primary px-4 py-3.5 text-[15px] text-slate-600 transition-colors"
              >
                <span className="font-mono text-xs text-primary pt-0.5">N/A</span>
                <span>{QUESTIONS[step].na}</span>
              </button>
            )}
          </div>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="mt-5 text-sm text-slate-500 underline hover:text-slate-900">
              Back
            </button>
          )}
        </div>
      )}

      {stage === "seats" && (
        <div>
          <div className={`${eyebrow} text-slate-500 mb-3`}>Final question</div>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug mb-6">
            Roughly how many people in your function use AI tools in their work?
          </h3>
          <div className="flex flex-col gap-2.5">
            {SEAT_OPTIONS.map(([v, t]) => (
              <button
                key={t}
                onClick={() => {
                  setAiUsers(v);
                  setStage("gate");
                }}
                className="flex items-start gap-3.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary px-4 py-3.5 text-[15px] text-slate-900 transition-colors"
              >
                <span className="font-mono text-xs text-primary pt-0.5">·</span>
                <span>{t}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStage("questions")} className="mt-5 text-sm text-slate-500 underline hover:text-slate-900">
            Back
          </button>
        </div>
      )}

      {stage === "gate" && (
        <form onSubmit={submit} className="space-y-4">
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug">
            Where should the written position go?
          </h3>
          {[
            { k: "name", l: "Name", type: "text", ac: "name" },
            { k: "email", l: "Work email", type: "email", ac: "email" },
            { k: "company", l: "Company", type: "text", ac: "organization" },
            { k: "role", l: "Job title", type: "text", ac: "organization-title" },
          ].map((f) => (
            <div key={f.k}>
              <label htmlFor={`gr-${f.k}`} className={`${eyebrow} text-slate-500 mb-1.5 block`}>
                {f.l}
                {["name", "email", "phone"].includes(f.k) ? " *" : ""}
              </label>
              <input
                id={`gr-${f.k}`}
                type={f.type}
                autoComplete={f.ac}
                value={lead[f.k as keyof typeof lead]}
                onChange={(e) => setLead({ ...lead, [f.k]: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-primary"
              />
            </div>
          ))}
          <div>
            <label htmlFor="gr-phone" className={`${eyebrow} text-slate-500 mb-1.5 block`}>
              Phone *
            </label>
            <div className="flex gap-2">
              <select
                aria-label="Country dialling code"
                value={dialCode}
                onChange={(e) => setDialCode(e.target.value)}
                className="w-[124px] shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 text-base focus:outline-none focus:border-primary"
              >
                {countryCodes.map((c) => (
                  <option key={c.label} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                id="gr-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="7700 900000"
                value={lead.phone}
                onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-5 py-4 font-extrabold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Scoring…" : "Show my position"}
          </button>
          <p className="text-xs text-slate-500 leading-relaxed">
            We will send you a copy so you can forward it internally. No newsletter signup, no sharing with third parties.
          </p>
        </form>
      )}

      {stage === "results" && (
        <div>
          <div className={`${eyebrow} text-slate-500 mb-5`}>
            {lead.company || "Your function"} · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </div>

          {emailSent && (
            <p className="text-sm text-slate-600 mb-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              A copy has been emailed to <b className="text-slate-900">{lead.email}</b>.
            </p>
          )}

          <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
            <div className="p-5 border-b border-slate-200">
              <div className={`${eyebrow} ${band.tone}`}>Summary position</div>
              <div className={`font-extrabold tracking-tight text-4xl md:text-5xl leading-none mt-2 ${band.tone}`}>{band.name}</div>
              <div className="font-mono text-[13px] text-slate-500 mt-2.5">{total.toFixed(1)} / 20</div>
            </div>
            <div className="p-5 bg-slate-50 text-[15px] text-slate-700">{band.desc}</div>
          </div>

          <div className="rounded-xl border border-slate-200 p-5 mb-6">
            <div className={`${eyebrow} text-slate-500 mb-3`}>Readiness profile</div>
            <GovernanceRadarChart labels={[...DOMAINS]} values={domainScores} max={4} />
          </div>

          <table className="w-full border-collapse mb-7">
            <thead>
              <tr>
                <th className={`${eyebrow} text-slate-500 text-left font-normal pb-2.5 border-b border-slate-200`}>Domain</th>
                <th className={`${eyebrow} text-slate-500 text-right font-normal pb-2.5 border-b border-slate-200`}>Score</th>
              </tr>
            </thead>
            <tbody>
              {DOMAINS.map((d, i) => (
                <tr key={d}>
                  <td className="py-3.5 border-b border-slate-200 align-top">
                    <span className="font-semibold text-slate-900 text-[15px]">{d}</span>
                    <span className="block text-[13px] text-slate-500 mt-1 leading-relaxed">{REMEDY[i].w}</span>
                  </td>
                  <td
                    className={`py-3.5 border-b border-slate-200 text-right font-mono font-semibold whitespace-nowrap align-top ${
                      domainScores[i] <= 1 ? "text-red-600" : domainScores[i] <= 2.5 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {domainScores[i].toFixed(1)}/4
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="font-extrabold text-lg text-slate-900 mb-3.5">Three things to fix first</h4>
          {weakest.map((w) => (
            <div key={w.i} className="border-l-2 border-primary pl-4 mb-4">
              <b className="block text-[15px] text-slate-900 mb-1">{REMEDY[w.i].t}</b>
              <span className="text-sm text-slate-500">
                {DOMAINS[w.i]} scored {w.s.toFixed(1)} of 4.
              </span>
            </div>
          ))}

          <div className="rounded-xl border border-primary bg-slate-50 p-6 mt-8">
            {total <= 10 && aiUsers >= 15 ? (
              <>
                <h4 className="font-extrabold text-lg text-slate-900 mb-2.5">Book a 30 minute review</h4>
                <p className="text-sm text-slate-600 mb-5">
                  With around {aiUsers >= 50 ? "50 or more" : aiUsers >= 25 ? "25 to 49" : "10 to 24"} people using AI tools and no evidence trail behind
                  them, this is worth half an hour rather than a download. You leave with a written gap position for your board. Free, and the assessment
                  above stands either way.
                </p>
                <a href={ZOOM_SCHEDULER_URL} target="_blank" rel="noopener noreferrer" className="block text-center rounded-lg bg-primary px-5 py-4 font-extrabold text-white hover:bg-primary/90">
                  Book the review
                </a>
              </>
            ) : total <= 15 ? (
              <>
                <h4 className="font-extrabold text-lg text-slate-900 mb-2.5">Discover our learning options / Book a Call with Us</h4>
                <p className="text-sm text-slate-600 mb-5">
                  Safety 4.0: Leading Safety in the Digital Age is approved training by IOSH and CPD-certified, and produces the certificated evidence the
                  literacy obligation asks for. £497.
                </p>
                <a href="/elearning" className="block text-center rounded-lg bg-primary px-5 py-4 font-extrabold text-white hover:bg-primary/90">
                  Discover our learning options
                </a>
                <a href={ZOOM_SCHEDULER_URL} target="_blank" rel="noopener noreferrer" className="block text-center rounded-lg border border-slate-300 px-5 py-4 font-semibold text-primary mt-3 hover:bg-slate-100">
                  Book a Call with Us
                </a>
              </>
            ) : (
              <>
                <h4 className="font-extrabold text-lg text-slate-900 mb-2.5">Keep it current</h4>
                <p className="text-sm text-slate-600 mb-5">
                  Your position holds. AI Fundamentals in EHS is the refresher that keeps new joiners on the same footing as the rest of your function.
                </p>
                <a href="/ai-fundamentals" className="block text-center rounded-lg bg-primary px-5 py-4 font-extrabold text-white hover:bg-primary/90">
                  See the course
                </a>
              </>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-7 pt-5 border-t border-slate-200 leading-relaxed">
            The AI literacy obligation under the EU AI Act has applied since 2 February 2025 to organisations deploying AI systems, not only those building
            them. Article 50 transparency obligations apply from 2 August 2026. High-risk obligations were deferred to 2 December 2027 under the Digital
            Omnibus. The UK has no equivalent statutory framework; the relevant pressure there comes from ISO 42001, insurer due diligence, and the general
            duty to ensure competence.
            <br />
            <br />
            This assessment is a self-reported indicator, not a legal opinion or a formal audit.
          </p>
        </div>
      )}
    </div>
  );
};

export default GovernanceReadinessAssessment;
