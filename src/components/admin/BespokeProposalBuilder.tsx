import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, Send } from "lucide-react";
import { toast } from "sonner";
import { BespokeProposalDocument } from "@/components/proposal/BespokeProposalDocument";

interface ProposalSection {
  id: string;
  title: string;
  type: "text" | "table" | "list" | "roi_table" | "pricing_table";
  content: Record<string, any>;
  order: number;
}

interface BespokeProposal {
  organisation: string;
  contact_name: string;
  contact_email: string;
  contact_emails: string[]; // Multiple recipients
  intro_note: string;
  valid_until: string;
  sections: ProposalSection[];
}

const emptyProposal = (): BespokeProposal => ({
  organisation: "",
  contact_name: "",
  contact_email: "",
  contact_emails: [],
  intro_note: "",
  valid_until: "",
  sections: [],
});

const sectionTemplates = {
  text: { body: "" },
  table: { headers: ["Column 1", "Column 2"], rows: [["", ""]] },
  list: { items: ["Item 1", "Item 2"] },
  roi_table: {
    data: {
      participants: 60,
      timePerWeek: 1,
      hourlyRate: 75,
      weeks: 52,
    },
  },
  pricing_table: {
    tiers: [
      { seats: "Up to 50", price: 2000 },
      { seats: "51-60", price: 1800 },
      { seats: "75+", price: 1600 },
    ],
  },
};

export const BespokeProposalBuilder = () => {
  const [form, setForm] = useState<BespokeProposal>(emptyProposal());
  const [preview, setPreview] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const addSection = (type: keyof typeof sectionTemplates) => {
    const newSection: ProposalSection = {
      id: crypto.randomUUID(),
      title: type.charAt(0).toUpperCase() + type.slice(1),
      type: type as ProposalSection["type"],
      content: sectionTemplates[type],
      order: form.sections.length,
    };
    setForm((f) => ({ ...f, sections: [...f.sections, newSection] }));
  };

  const updateSection = (id: string, updates: Partial<ProposalSection>) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const removeSection = (id: string) => {
    setForm((f) => ({ ...f, sections: f.sections.filter((s) => s.id !== id) }));
  };

  const addRecipient = () => {
    if (!newEmail.trim()) {
      toast.error("Enter an email address");
      return;
    }
    if (form.contact_emails.includes(newEmail.trim())) {
      toast.error("Email already added");
      return;
    }
    setForm((f) => ({
      ...f,
      contact_emails: [...f.contact_emails, newEmail.trim()],
    }));
    setNewEmail("");
  };

  const removeRecipient = (email: string) => {
    setForm((f) => ({
      ...f,
      contact_emails: f.contact_emails.filter((e) => e !== email),
    }));
  };

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await supabase.functions.invoke("parse-proposal-document", {
        body: formData,
      });

      if (response.error) {
        throw response.error;
      }

      const parsed = response.data;

      // Auto-fill the form with extracted data
      setForm({
        organisation: parsed.organisation || "",
        contact_name: parsed.contact_name || "",
        contact_email: parsed.contact_email || "",
        contact_emails: parsed.contact_email ? [parsed.contact_email] : [],
        intro_note: parsed.intro_note || "",
        valid_until: "30",
        sections: parsed.sections || [],
      });

      toast.success(`Proposal loaded! ${parsed.sections?.length || 0} sections extracted`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse document. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = ""; // Reset file input
    }
  };

  const handleSave = async () => {
    if (!form.organisation || form.contact_emails.length === 0) {
      toast.error("Organisation and at least one recipient required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("proposals")
        .insert({
          organisation: form.organisation,
          contact_name: form.contact_name || null,
          contact_email: form.contact_emails[0],
          contact_emails_json: form.contact_emails,
          intro_note: form.intro_note || null,
          valid_until: parseInt(form.valid_until) || 30,
          sections: form.sections,
          proposal_type: "bespoke",
          status: "draft",
        });

      if (error) {
        throw error;
      }

      toast.success("Proposal saved!");
      setForm(emptyProposal());
    } catch (error) {
      console.error(error);
      toast.error("Failed to save proposal");
    } finally {
      setSaving(false);
    }
  };

  const handleSendToRecipients = async () => {
    if (!form.organisation || form.contact_emails.length === 0) {
      toast.error("Organisation and at least one recipient required");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-proposal-email",
        {
          body: {
            proposal: {
              organisation: form.organisation,
              contact_name: form.contact_name,
              contact_emails: form.contact_emails,
              intro_note: form.intro_note,
              valid_until: parseInt(form.valid_until) || 30,
              sections: form.sections,
            },
          },
        }
      );

      if (error) {
        throw error;
      }

      toast.success(`Proposal sent to ${form.contact_emails.length} recipient(s)`);
      setForm(emptyProposal());
    } catch (error) {
      console.error(error);
      toast.error("Failed to send proposal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bespoke Proposal Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex flex-col gap-2 cursor-pointer">
              <span className="text-sm font-semibold text-blue-900">📄 Upload Proposal Document</span>
              <span className="text-xs text-blue-700">Upload a Word or PDF proposal to auto-fill all sections</span>
              <input
                type="file"
                accept=".docx,.doc,.pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="text-sm"
              />
            </label>
            {uploading && <p className="text-xs text-blue-600 mt-2">Parsing document...</p>}
          </div>

          {/* Header Info */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold">Proposal Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Organisation *</Label>
                <Input
                  value={form.organisation}
                  onChange={(e) =>
                    setForm({ ...form, organisation: e.target.value })
                  }
                  placeholder="Expand Energy"
                />
              </div>
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={form.contact_name}
                  onChange={(e) =>
                    setForm({ ...form, contact_name: e.target.value })
                  }
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <Label>Valid Until (days)</Label>
                <Input
                  type="number"
                  value={form.valid_until}
                  onChange={(e) =>
                    setForm({ ...form, valid_until: e.target.value })
                  }
                  placeholder="30"
                />
              </div>
            </div>

            {/* Multiple Email Recipients */}
            <div>
              <Label>Recipients</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@company.com"
                  onKeyPress={(e) => e.key === "Enter" && addRecipient()}
                />
                <Button onClick={addRecipient} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.contact_emails.map((email) => (
                  <div
                    key={email}
                    className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    {email}
                    <button
                      onClick={() => removeRecipient(email)}
                      className="text-primary hover:text-primary/80"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Intro Note</Label>
              <Textarea
                value={form.intro_note}
                onChange={(e) =>
                  setForm({ ...form, intro_note: e.target.value })
                }
                placeholder="Thank you for the conversation..."
                rows={3}
              />
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Proposal Sections</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addSection("text")}
                >
                  <Plus className="h-4 w-4 mr-1" /> Text Section
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addSection("table")}
                >
                  <Plus className="h-4 w-4 mr-1" /> Table
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addSection("pricing_table")}
                >
                  <Plus className="h-4 w-4 mr-1" /> Pricing
                </Button>
              </div>
            </div>

            {form.sections.map((section) => (
              <Card key={section.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Input
                        value={section.title}
                        onChange={(e) =>
                          updateSection(section.id, { title: e.target.value })
                        }
                        className="font-semibold text-base"
                        placeholder="Section Title"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Section-specific content editor */}
                  {section.type === "text" && (
                    <Textarea
                      value={section.content.body || ""}
                      onChange={(e) =>
                        updateSection(section.id, {
                          content: { body: e.target.value },
                        })
                      }
                      placeholder="Enter section content..."
                      rows={6}
                      className="font-mono text-sm"
                    />
                  )}

                  {section.type === "table" && (
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-500">
                        Edit headers and rows as JSON
                      </p>
                      <Textarea
                        value={JSON.stringify(section.content, null, 2)}
                        onChange={(e) => {
                          try {
                            updateSection(section.id, {
                              content: JSON.parse(e.target.value),
                            });
                          } catch {
                            /* Invalid JSON, let user fix it */
                          }
                        }}
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>
                  )}

                  {section.type === "pricing_table" && (
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-500">Pricing tiers (JSON)</p>
                      <Textarea
                        value={JSON.stringify(section.content, null, 2)}
                        onChange={(e) => {
                          try {
                            updateSection(section.id, {
                              content: JSON.parse(e.target.value),
                            });
                          } catch {
                            /* Invalid JSON */
                          }
                        }}
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={() => setPreview(true)} variant="outline">
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.organisation || form.contact_emails.length === 0 || saving}
              variant="outline"
            >
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={handleSendToRecipients}
              disabled={!form.organisation || form.contact_emails.length === 0 || saving}
            >
              <Send className="h-4 w-4 mr-2" /> Send to {form.contact_emails.length}{" "}
              recipient{form.contact_emails.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8 mx-4">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="font-semibold">Preview</h3>
              <button
                onClick={() => setPreview(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto">
              <BespokeProposalDocument
                organisation={form.organisation}
                contact_name={form.contact_name}
                intro_note={form.intro_note}
                sections={form.sections}
                valid_until={form.valid_until}
                token=""
                created_at={new Date().toISOString()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BespokeProposalBuilder;
