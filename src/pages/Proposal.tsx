import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Download, Lock } from "lucide-react";
import logo from "@/assets/safety-academy-logo.png";
import ProposalDocument from "@/components/proposal/ProposalDocument";
import { asProposal, type Proposal } from "@/lib/proposals";

const ProposalPage = () => {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requiresEmail, setRequiresEmail] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string>(
    () => sessionStorage.getItem(`proposal-email-${token ?? ""}`) ?? "",
  );

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
        body: { token, action: "view", email: verifiedEmail },
      });
      if (data?.requiresEmail) {
        setRequiresEmail(true);
        setHint(data.hint ?? null);
        if (verifiedEmail) sessionStorage.removeItem(`proposal-email-${token}`);
      } else if (err || !data?.proposal) {
        setError("This proposal link is invalid or is no longer available.");
      } else {
        const p = asProposal(data.proposal);
        setProposal(p);
        setName(p.approver_name ?? p.contact_name ?? "");
      }
      setLoading(false);
    };
    if (token) load();
  }, [token, verifiedEmail]);

  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setVerifying(true);
    const { data } = await supabase.functions.invoke("proposal-public", {
      body: { token, action: "view", email: value },
    });
    setVerifying(false);
    if (data?.proposal) {
      sessionStorage.setItem(`proposal-email-${token}`, value);
      const p = asProposal(data.proposal);
      setProposal(p);
      setName(p.approver_name ?? p.contact_name ?? "");
      setRequiresEmail(false);
      setVerifiedEmail(value);
    } else {
      setHint(data?.hint ?? null);
      toast.error(data?.error ?? "That email doesn't match this proposal.");
    }
  };

  const respond = async (decision: "approved" | "declined") => {
    if (decision === "approved" && name.trim().length < 2) {
      toast.error("Please enter your full name to approve.");
      return;
    }
    setSubmitting(true);
    const { data, error: err } = await supabase.functions.invoke("proposal-public", {
      body: {
        token,
        action: "respond",
        decision,
        approverName: name,
        approverNote: note,
        email: verifiedEmail,
      },
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

  if (requiresEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center">
          <img
            src={logo}
            alt="SafetyTech Academy"
            className="h-20 md:h-24 w-auto max-w-full mx-auto mb-8"
          />
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 text-left">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center mb-4">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Confirm your email to view this proposal
            </h1>
            <p className="text-white/70 text-sm mt-2">
              This proposal is private. Enter the email address it was sent to
              {hint ? ` (${hint})` : ""}.
            </p>
            <form onSubmit={verifyEmail} className="mt-5 space-y-3">
              <Label htmlFor="recipient-email" className="text-white/80 text-xs">
                Email address
              </Label>
              <Input
                id="recipient-email"
                type="email"
                autoFocus
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@company.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Button type="submit" size="lg" className="w-full" disabled={verifying}>
                {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                View proposal
              </Button>
            </form>
          </div>
          <p className="text-white/40 text-xs mt-6">
            Wrong address? Reply to the email you received and we'll re-issue the link.
          </p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div>
          <img
            src={logo}
            alt="SafetyTech Academy"
            className="h-20 md:h-24 w-auto max-w-full mx-auto mb-6"
          />
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  const decided = proposal.status === "approved" || proposal.status === "declined";

  return (
    <div className="min-h-screen bg-white">
      {/* Download bar */}
      <div className="print:hidden bg-slate-100 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <ProposalDocument proposal={proposal} />

      {/* Acceptance (screen only — page 2 of the printed PDF carries the terms) */}
      <div className="print:hidden max-w-4xl mx-auto px-6 pb-12">
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
                Approving confirms the scope, pricing and terms above. No payment is taken now.
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
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
