import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Award, Send, Copy, ExternalLink, Ban, Trash2, Loader2, RotateCcw, Eye, MousePointerClick, Linkedin } from "lucide-react";
import { CertificateDocument } from "@/components/certificates/CertificateDocument";

interface Certificate {
  id: string;
  certificate_number: string;
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  completion_date: string;
  credential_level: string | null;
  cpd_hours: number | null;
  status: string;
  issued_at: string;
  revoked_at: string | null;
  viewed_at: string | null;
  engaged_at: string | null;
  linkedin_added_at: string | null;
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

const COURSE_OPTIONS = [
  "Safety 4.0 Accelerator",
  "IOSH-approved Safety 4.0 - Leading Safety in the Digital Age",
];

export const CertificatesTab = () => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    courseName: COURSE_OPTIONS[0],
    completionDate: new Date().toISOString().slice(0, 10),
    credentialLevel: "",
    cpdHours: "",
  });

  const fetchCerts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("issued_at", { ascending: false });
    if (error) {
      toast.error("Could not load certificates");
    } else {
      setCerts((data as unknown as Certificate[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientName.trim() || !form.recipientEmail.trim() || !form.courseName.trim()) {
      toast.error("Name, email and course are required");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("issue-certificate", {
        body: {
          recipientName: form.recipientName.trim(),
          recipientEmail: form.recipientEmail.trim(),
          courseName: form.courseName.trim(),
          completionDate: form.completionDate,
          credentialLevel: form.credentialLevel.trim() || null,
          cpdHours: form.cpdHours ? Number(form.cpdHours) : null,
        },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error((data as { error?: string })?.error || error?.message || "Failed");
      }
      const num = (data as { certificate?: { certificate_number?: string } })?.certificate?.certificate_number;
      toast.success(`Certificate ${num} issued and emailed`);
      setForm((f) => ({ ...f, recipientName: "", recipientEmail: "", credentialLevel: "", cpdHours: "" }));
      fetchCerts();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to issue certificate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (cert: Certificate) => {
    setResendingId(cert.id);
    try {
      const { data, error } = await supabase.functions.invoke("issue-certificate", {
        body: { resendCertificateNumber: cert.certificate_number },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error((data as { error?: string })?.error || error?.message || "Failed");
      }
      toast.success(`Re-sent to ${cert.recipient_email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setResendingId(null);
    }
  };

  const toggleRevoke = async (cert: Certificate) => {
    const revoke = cert.status !== "revoked";
    const { error } = await supabase
      .from("certificates")
      .update({
        status: revoke ? "revoked" : "issued",
        revoked_at: revoke ? new Date().toISOString() : null,
      })
      .eq("id", cert.id);
    if (error) {
      toast.error("Update failed");
    } else {
      toast.success(revoke ? "Certificate revoked" : "Certificate reinstated");
      fetchCerts();
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("certificates").delete().eq("id", toDelete.id);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Certificate deleted");
      setToDelete(null);
      fetchCerts();
    }
  };

  const copyLink = (cert: Certificate) => {
    navigator.clipboard.writeText(`${SITE_URL}/verify/${cert.certificate_number}`);
    toast.success("Verification link copied");
  };

  const InteractionStatus = ({ cert }: { cert: Certificate }) => {
    const steps = [
      { label: "Sent", done: true, when: cert.issued_at, Icon: Send, color: "text-primary" },
      { label: "Viewed by recipient", done: !!cert.viewed_at, when: cert.viewed_at, Icon: Eye, color: "text-secondary" },
      { label: "Engaged by recipient", done: !!cert.engaged_at, when: cert.engaged_at, Icon: MousePointerClick, color: "text-secondary" },
      { label: "Added to LinkedIn", done: !!cert.linkedin_added_at, when: cert.linkedin_added_at, Icon: Linkedin, color: "text-[#0a66c2]" },
    ];
    return (
      <div className="flex items-center gap-2">
        {steps.map(({ label, done, when, Icon, color }) => (
          <span
            key={label}
            title={done ? `${label}${when ? ` · ${new Date(when).toLocaleString("en-GB")}` : ""}` : `Not ${label.toLowerCase()} yet`}
            className={done ? color : "text-muted-foreground/30"}
          >
            <Icon className="h-4 w-4" />
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Issue form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Award className="h-5 w-5 text-primary" /> Issue a new certificate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIssue} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="recipientName">Recipient name *</Label>
              <Input id="recipientName" value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })} placeholder="Jane Smith" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="recipientEmail">Recipient email *</Label>
              <Input id="recipientEmail" type="email" value={form.recipientEmail}
                onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })} placeholder="jane@company.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="courseName">Course *</Label>
              <Select value={form.courseName} onValueChange={(v) => setForm({ ...form, courseName: v })}>
                <SelectTrigger id="courseName">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="completionDate">Completion date *</Label>
              <Input id="completionDate" type="date" value={form.completionDate}
                onChange={(e) => setForm({ ...form, completionDate: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="credentialLevel">Credential level (optional)</Label>
              <Input id="credentialLevel" value={form.credentialLevel}
                onChange={(e) => setForm({ ...form, credentialLevel: e.target.value })} placeholder="e.g. Practitioner" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cpdHours">CPD hours (optional)</Label>
              <Input id="cpdHours" type="number" min="0" value={form.cpdHours}
                onChange={(e) => setForm({ ...form, cpdHours: e.target.value })} placeholder="e.g. 20" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Issue & email certificate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Issued certificates ({certs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : certs.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No certificates issued yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certs.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.certificate_number}</TableCell>
                      <TableCell>
                        <div className="font-medium">{c.recipient_name}</div>
                        <div className="text-xs text-muted-foreground">{c.recipient_email}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{c.course_name}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(c.completion_date).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          c.status === "revoked"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-primary/20 text-primary"
                        }`}>
                          {c.status === "revoked" ? "Revoked" : "Valid"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <InteractionStatus cert={c} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" title="Open verification page"
                            onClick={() => window.open(`${SITE_URL}/verify/${c.certificate_number}`, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Copy verification link" onClick={() => copyLink(c)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Resend email"
                            disabled={resendingId === c.id} onClick={() => handleResend(c)}>
                            {resendingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" title={c.status === "revoked" ? "Reinstate" : "Revoke"}
                            onClick={() => toggleRevoke(c)}>
                            {c.status === "revoked" ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4 text-destructive" />}
                          </Button>
                          <Button size="icon" variant="ghost" title="Delete" onClick={() => setToDelete(c)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete certificate?</DialogTitle>
            <DialogDescription>
              This permanently removes {toDelete?.certificate_number} for {toDelete?.recipient_name}. The verification
              link will stop working. Consider revoking instead to keep an audit trail.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
