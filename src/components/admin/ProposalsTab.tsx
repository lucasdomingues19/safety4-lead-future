import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Copy,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  Eye,
  Send,
} from "lucide-react";
import ProposalDocument from "@/components/proposal/ProposalDocument";
import {
  asProposal,
  COURSE_CATALOGUE,
  formatMoney,
  proposalTotals,
  type Proposal,
  type ProposalItem,
} from "@/lib/proposals";

const emptyForm = () => ({
  organisation: "",
  contact_name: "",
  contact_role: "",
  contact_email: "",
  intro_note:
    "Thank you for the conversation. Below is our recommended training programme, scoped to your team's needs.",
  discount_pct: 0,
  valid_until: "",
  items: [] as ProposalItem[],
});

export const ProposalsTab = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [preview, setPreview] = useState<Proposal | null>(null);
  const [sendFor, setSendFor] = useState<Proposal | null>(null);
  const [mail, setMail] = useState({ to: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Could not load proposals");
    setProposals(((data ?? []) as Record<string, unknown>[]).map(asProposal));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addItem = (preset?: (typeof COURSE_CATALOGUE)[number]) => {
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        {
          id: crypto.randomUUID(),
          name: preset?.name ?? "",
          description: preset?.description ?? "",
          unitPrice: preset?.unitPrice ?? 0,
          url: preset?.url,
          seats: 1,
        },
      ],
    }));
  };

  const updateItem = (id: string, patch: Partial<ProposalItem>) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));

  const removeItem = (id: string) =>
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.id !== id) }));

  /** Build a Proposal-shaped object from the unsaved form for previewing. */
  const draftProposal = (): Proposal => ({
    id: "draft",
    token: "DRAFT",
    organisation: form.organisation || "Your organisation",
    contact_name: form.contact_name || null,
    contact_role: form.contact_role || null,
    contact_email: form.contact_email || null,
    intro_note: form.intro_note || null,
    items: form.items,
    discount_pct: Number(form.discount_pct) || 0,
    currency: "GBP",
    valid_until: form.valid_until || null,
    status: "draft",
    approver_name: null,
    approver_note: null,
    responded_at: null,
    view_count: 0,
    created_at: new Date().toISOString(),
  });

  const save = async () => {
    if (!form.organisation.trim()) {
      toast.error("Organisation name is required");
      return;
    }
    if (form.items.length === 0) {
      toast.error("Add at least one course");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("proposals").insert({
      organisation: form.organisation.trim(),
      contact_name: form.contact_name.trim() || null,
      contact_role: form.contact_role.trim() || null,
      contact_email: form.contact_email.trim() || null,
      intro_note: form.intro_note.trim() || null,
      items: form.items as unknown as never,
      discount_pct: Number(form.discount_pct) || 0,
      valid_until: form.valid_until || null,
      status: "sent",
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save proposal");
      return;
    }
    toast.success("Proposal created — preview it, then send from Gmail.");
    setForm(emptyForm());
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("proposals").delete().eq("id", id);
    if (error) toast.error("Could not delete");
    else {
      toast.success("Proposal deleted");
      setProposals((p) => p.filter((x) => x.id !== id));
    }
  };

  const linkFor = (token: string) => `${window.location.origin}/proposal_${token}`;

  const copy = (token: string) => {
    navigator.clipboard.writeText(linkFor(token));
    toast.success("Private link copied");
  };

  const openSend = (p: Proposal) => {
    const t = proposalTotals(p.items, p.discount_pct);
    setSendFor(p);
    setMail({
      to: p.contact_email ?? "",
      subject: `Training proposal for ${p.organisation} — SafetyTech Academy`,
      body: `Hi ${p.contact_name || "there"},

Thank you for your time. Please find your training proposal for ${p.organisation} here:

${linkFor(p.token)}

It covers who we are, the recommended programme (${p.items.length} item${p.items.length === 1 ? "" : "s"}, total ${formatMoney(t.total, p.currency)} excl. VAT) and our terms. You can approve it directly on the page, or download it as a PDF.

The link is private — please only share it inside your organisation.

Happy to jump on a call if anything needs adjusting.

Best regards,
Lucas Domingues
MSc, CMIOSH — Founder, SafetyTech Academy
https://safetytech.academy
+44 7983 819437`,
    });
  };

  const sendEmail = async () => {
    if (!sendFor) return;
    if (!mail.to.trim()) {
      toast.error("Recipient email is required");
      return;
    }
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-lead-gmail", {
      body: { to: mail.to.trim(), subject: mail.subject, body: mail.body },
    });
    if (error || !data?.success) {
      setSending(false);
      toast.error("Could not send via Gmail. Check the Gmail connection.");
      return;
    }
    await supabase
      .from("proposals")
      .update({ status: "sent", contact_email: mail.to.trim() })
      .eq("id", sendFor.id);
    setSending(false);
    setSendFor(null);
    toast.success("Proposal sent from your Gmail");
    load();
  };

  const totals = proposalTotals(form.items, form.discount_pct);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> New proposal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="p-org">Organisation *</Label>
              <Input
                id="p-org"
                value={form.organisation}
                onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                placeholder="Acme Energy Ltd"
              />
            </div>
            <div>
              <Label htmlFor="p-name">Contact name</Label>
              <Input
                id="p-name"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <Label htmlFor="p-role">Role</Label>
              <Input
                id="p-role"
                value={form.contact_role}
                onChange={(e) => setForm({ ...form, contact_role: e.target.value })}
                placeholder="Head of HSE"
              />
            </div>
            <div>
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="jane@acme.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="p-intro">Intro note</Label>
            <Textarea
              id="p-intro"
              rows={3}
              value={form.intro_note}
              onChange={(e) => setForm({ ...form, intro_note: e.target.value })}
            />
          </div>

          <div>
            <Label>Courses</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COURSE_CATALOGUE.map((c) => (
                <Button key={c.name} size="sm" variant="outline" onClick={() => addItem(c)}>
                  <Plus className="h-3 w-3 mr-1" />
                  {c.name.split("—")[0].trim()}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => addItem()}>
                <Plus className="h-3 w-3 mr-1" /> Custom line
              </Button>
            </div>

            <div className="space-y-3 mt-4">
              {form.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      placeholder="Course name"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Short description shown to the client"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Seats</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.seats}
                        onChange={(e) => updateItem(item.id, { seats: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Price per seat (£, 0 = on request)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Programme page link</Label>
                      <Input
                        value={item.url ?? ""}
                        onChange={(e) => updateItem(item.id, { url: e.target.value })}
                        placeholder="/elearning"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="p-disc">Discount %</Label>
              <Input
                id="p-disc"
                type="number"
                min={0}
                max={100}
                value={form.discount_pct}
                onChange={(e) => setForm({ ...form, discount_pct: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="p-valid">Valid until</Label>
              <Input
                id="p-valid"
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total (excl. VAT)</p>
              <p className="text-2xl font-bold">{formatMoney(totals.total)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setPreview(draftProposal())}>
              <Eye className="h-4 w-4 mr-2" /> Preview proposal
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create proposal &amp; link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals yet.</p>
          ) : (
            <div className="space-y-3">
              {proposals.map((p) => {
                const t = proposalTotals(p.items, p.discount_pct);
                return (
                  <div
                    key={p.id}
                    className="border rounded-lg p-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {p.organisation}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {p.contact_name ? `· ${p.contact_name}` : ""}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatMoney(t.total, p.currency)} · {p.items.length} course(s) ·{" "}
                        {p.view_count} view(s) ·{" "}
                        <span
                          className={
                            p.status === "approved"
                              ? "text-green-600 font-semibold"
                              : p.status === "declined"
                                ? "text-destructive font-semibold"
                                : ""
                          }
                        >
                          {p.status}
                        </span>
                        {p.approver_name ? ` by ${p.approver_name}` : ""}
                      </p>
                      {p.approver_note && (
                        <p className="text-xs italic text-muted-foreground mt-1">
                          “{p.approver_note}”
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreview(p)}>
                        <Eye className="h-3 w-3 mr-1" /> Preview
                      </Button>
                      <Button size="sm" onClick={() => openSend(p)}>
                        <Send className="h-3 w-3 mr-1" /> Send via Gmail
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copy(p.token)}>
                        <Copy className="h-3 w-3 mr-1" /> Copy link
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={linkFor(p.token)} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Proposal preview</DialogTitle>
            <DialogDescription>
              Exactly what the recipient sees. Three pages: about us, your proposal, terms.
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="border-t">
              <ProposalDocument proposal={preview} preview />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send dialog */}
      <Dialog open={!!sendFor} onOpenChange={(o) => !o && setSendFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send proposal from Gmail</DialogTitle>
            <DialogDescription>
              Sent from your connected Gmail account, with the private proposal link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="m-to">To</Label>
              <Input
                id="m-to"
                type="email"
                value={mail.to}
                onChange={(e) => setMail({ ...mail, to: e.target.value })}
                placeholder="jane@acme.com"
              />
            </div>
            <div>
              <Label htmlFor="m-sub">Subject</Label>
              <Input
                id="m-sub"
                value={mail.subject}
                onChange={(e) => setMail({ ...mail, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="m-body">Message</Label>
              <Textarea
                id="m-body"
                rows={14}
                value={mail.body}
                onChange={(e) => setMail({ ...mail, body: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={sendEmail} disabled={sending}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send email
              </Button>
              <Button
                variant="outline"
                onClick={() => sendFor && setPreview(sendFor)}
              >
                <Eye className="h-4 w-4 mr-2" /> Preview first
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
