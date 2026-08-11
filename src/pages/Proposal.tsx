import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Printer, ShieldCheck, Award, Mail, Phone } from "lucide-react";
import logo from "@/assets/safety-academy-logo.png";
import { asProposal, formatMoney, proposalTotals, type Proposal } from "@/lib/proposals";

const Proposal = () => {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Training Proposal | SafetyTech Academy";
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) meta.setAttribute("content", "noindex, nofollow");
    else {
      const m = document.createElement("meta");
      m.name = "robots";
      m.content = "noindex, nofollow";
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data, error: err } = await supabase.functions.invoke("proposal-public", {
        body: { token, action: "view" },
      });
      if (err || !data?.proposal) {
        setError("This proposal link is invalid or is no longer available.");
      } else {
        const p = asProposal(data.proposal);
        setProposal(p);
        setName(p.approver_name ?? p.contact_name ?? "");
      }
      setLoading(false);
    };
    if (token) load();
  }, [token]);

  const respond = async (decision: "approved" | "declined") => {
    if (decision === "approved" && name.trim().length < 2) {
      toast.error("Please enter your full name to approve.");
      return;
    }
    setSubmitting(true);
    const { data, error: err } = await supabase.functions.invoke("proposal-public", {
      body: { token, action: "respond", decision, approverName: name, approverNote: note },
    });
    setSubmitting(false);
    if (err || !data?.proposal) {
      toast.error("Could not record your response. Please try again.");
      return;
    }
    setProposal(asProposal(data.proposal));
    toast.success(decision === "approved" ? "Proposal approved — thank you!" : "Response recorded.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div>
          <img src={logo} alt="SafetyTech Academy" className="h-10 mx-auto mb-6" />
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  const { subtotal, discount, total } = proposalTotals(proposal.items, proposal.discount_pct);
  const decided = proposal.status === "approved" || proposal.status === "declined";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Page 1 — header + summary */}
      <header className="bg-background text-white print:bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <img src={logo} alt="SafetyTech Academy" className="h-10" />
          <div className="text-right text-xs">
            <p className="font-mono uppercase tracking-[0.25em] text-primary">Private proposal</p>
            <p className="text-white/70 mt-1">
              Ref {proposal.token.slice(0, 8).toUpperCase()} ·{" "}
              {new Date(proposal.created_at).toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <section>
          <span className="inline-block bg-primary text-primary-foreground text-xs font-mono uppercase tracking-[0.25em] px-3 py-1 rounded-full">
            Training Proposal
          </span>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05] text-slate-900">
            Safety 4.0 training for {proposal.organisation}
          </h1>
          <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wide">Prepared for</p>
              <p className="font-semibold">{proposal.contact_name || proposal.organisation}</p>
              {proposal.contact_role && <p className="text-slate-600">{proposal.contact_role}</p>}
              {proposal.contact_email && <p className="text-slate-600">{proposal.contact_email}</p>}
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wide">Organisation</p>
              <p className="font-semibold">{proposal.organisation}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wide">Valid until</p>
              <p className="font-semibold">
                {proposal.valid_until
                  ? new Date(proposal.valid_until).toLocaleDateString("en-GB")
                  : "30 days from issue"}
              </p>
            </div>
          </div>
          {proposal.intro_note && (
            <p className="mt-6 text-slate-600 leading-relaxed whitespace-pre-line">
              {proposal.intro_note}
            </p>
          )}
        </section>

        <section>
          <p className="font-mono uppercase tracking-[0.25em] text-xs text-primary mb-3">
            Recommended programme
          </p>
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-right px-4 py-3 w-20">Seats</th>
                  <th className="text-right px-4 py-3 w-28">Per seat</th>
                  <th className="text-right px-4 py-3 w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {proposal.items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      {item.description && (
                        <p className="text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">{item.seats}</td>
                    <td className="px-4 py-4 text-right">
                      {item.unitPrice ? formatMoney(item.unitPrice, proposal.currency) : "On request"}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold">
                      {item.unitPrice
                        ? formatMoney(item.unitPrice * item.seats, proposal.currency)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, proposal.currency)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Partnership discount ({proposal.discount_pct}%)</span>
                  <span>-{formatMoney(discount, proposal.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-2">
                <span>Total investment</span>
                <span>{formatMoney(total, proposal.currency)}</span>
              </div>
              <p className="text-xs text-slate-500 pt-1">Prices exclude VAT.</p>
            </div>
          </div>
        </section>

        {/* Page 2 — value + approval */}
        <section className="break-before-page">
          <p className="font-mono uppercase tracking-[0.25em] text-xs text-primary mb-3">
            What your team gets
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Award,
                title: "Recognised certification",
                body: "Approved training provider by IOSH, with CPD-accredited digital certificates and verifiable credentials.",
              },
              {
                icon: ShieldCheck,
                title: "Governance-ready skills",
                body: "Practical AI and digital safety governance capability your teams can apply immediately.",
              },
              {
                icon: CheckCircle2,
                title: "Managed rollout",
                body: "Seat allocation, progress tracking and completion reporting handled for you end to end.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 p-5">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900 mb-2">Next steps</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Approve this proposal below.</li>
              <li>We issue the invoice and confirm your start date.</li>
              <li>Learner access is provisioned within one working day.</li>
            </ol>
            <p className="mt-3">14-day money-back guarantee applies to all programmes.</p>
          </div>
        </section>

        <section className="print:hidden">
          <div className="rounded-2xl bg-background text-white p-6 md:p-8">
            {decided ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-xl font-bold">
                  {proposal.status === "approved" ? "Proposal approved" : "Response recorded"}
                </h2>
                <p className="text-white/70 mt-2 text-sm">
                  {proposal.approver_name ? `${proposal.approver_name} · ` : ""}
                  {proposal.responded_at
                    ? new Date(proposal.responded_at).toLocaleString("en-GB")
                    : ""}
                </p>
                <p className="text-white/70 mt-2 text-sm">
                  We'll be in touch at {proposal.contact_email || "your email"} shortly.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-1">
                  Review &amp; approve
                </h2>
                <p className="text-white/70 text-sm mb-5">
                  Approving confirms the scope and pricing above. No payment is taken now.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="approver-name" className="text-white/80 text-xs">
                      Your full name
                    </Label>
                    <Input
                      id="approver-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Smith"
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <Label htmlFor="approver-note" className="text-white/80 text-xs">
                      Comments (optional)
                    </Label>
                    <Textarea
                      id="approver-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="Anything we should adjust?"
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-5">
                  <Button onClick={() => respond("approved")} disabled={submitting} size="lg">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Approve proposal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => respond("declined")}
                    disabled={submitting}
                    size="lg"
                    className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    Not right now
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => window.print()}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Printer className="h-4 w-4 mr-2" /> Print / PDF
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-background text-white/60 text-xs">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-wrap gap-4 justify-between">
          <span>SafetyTech Academy — approved training provider by IOSH</span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> hello@safetyacademy.tech
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> +44 7983 819437
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Proposal;
