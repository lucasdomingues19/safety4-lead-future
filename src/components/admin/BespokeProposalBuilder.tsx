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
  title?: string;
  organisation: string;
  contact_name: string;
  contact_role?: string;
  contact_email: string;
  contact_emails: string[]; // Multiple recipients
  intro_note: string;
  valid_until: string;
  sections: ProposalSection[];
}

const emptyProposal = (): BespokeProposal => ({
  title: "",
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

const proposalTemplates: Record<"expand_energy" | "copilot_inperson_day", BespokeProposal> = {
  copilot_inperson_day: {
    organisation: "[Organisation]",
    title: "Copilot for EHS & Sustainability",
    contact_name: "[Contact name]",
    contact_role: "[Contact role]",
    contact_email: "",
    contact_emails: [] as string[],
    intro_note: "",
    valid_until: "30",
    sections: [
      {
        id: crypto.randomUUID(),
        title: "Summary",
        type: "text",
        content: { body: "Thank you for speaking with us about Microsoft 365 Copilot for your EHS and sustainability teams. We propose an in-person, hands-on Copilot training day at [Organisation]'s headquarters in [city] for up to 25 of your colleagues. To learn more about the course, see https://www.safetytech.academy/copilot-for-ehs." },
        order: 0,
      },
      {
        id: crypto.randomUUID(),
        title: "Why this matters now: EU AI Act, Article 4",
        type: "text",
        content: { body: "Article 4 of the EU AI Act requires organisations that use AI to make sure their staff have a sufficient level of AI literacy. The obligation has applied since February 2025, and enforcement begins in August 2026. This programme builds the practical skill your EHS and sustainability teams need to use Copilot safely, with a person checking every output. This is training, not legal advice: [Organisation]'s legal team should confirm how Article 4 applies to your organisation." },
        order: 1,
      },
      {
        id: crypto.randomUUID(),
        title: "Programme modules",
        type: "list",
        content: { items: ["1. AI Fundamentals for EHS Professionals || What generative AI is, how Copilot works, and the principle that the AI drafts while a competent person reviews and signs off.", "2. Prompt Engineering for EHS || The GRACE framework (Ground, Role, Artefact, Constraints, Evidence) for writing reliable, source-grounded prompts.", "3. Copilot in Apps for EHS Productivity (Part 1) || Using Copilot in everyday Microsoft 365 apps for EHS work, with hands-on practice.", "4. Copilot in Apps for EHS Productivity (Part 2) || Applying Copilot to more day-to-day EHS workflows, including reporting and analysis.", "5. Notebook || Building a shared EHS knowledge base in Copilot Notebooks from your own procedures and documents.", "6. Copilot Cowork || Working with Copilot on multi-step tasks alongside your team.", "7. Copilot Agents || Setting up agents for repeatable EHS tasks, with a person checking the output.", "8. AI Risks, Ethics, Security and Governance || Data protection, bias, security and the governance a safety function needs to use AI responsibly.", "9. Stay Copilot Confident || Keeping skills current with Microsoft's monthly Copilot releases, with a routine for review.", "10. Capstone Project: Copilot-Powered EHS Investigation & Improvement || A practical project: using Copilot to run an EHS investigation and an improvement programme from start to finish."] },
        order: 2,
      },
      {
        id: crypto.randomUUID(),
        title: "Venue, date and format",
        type: "text",
        content: { body: "Format: in person, one full day.\nVenue: [Organisation] headquarters, [city].\nDate: second half of November 2026, to be confirmed.\nParticipants: up to 25." },
        order: 3,
      },
      {
        id: crypto.randomUUID(),
        title: "Expected results",
        type: "list",
        content: { items: ["Less time spent drafting policies, procedures and safety communications, with the AI doing the first draft.", "Faster analysis of incident, inspection and ESG data, with a person checking every output.", "A team that can use Copilot safely in risk assessments, incident reporting and compliance work.", "Evidence of AI literacy for your organisation's compliance records."] },
        order: 4,
      },
      {
        id: crypto.randomUUID(),
        title: "Return on investment",
        type: "table",
        content: { headers: ["Measure", "Value"], rows: [["Participants", "25"], ["Hours saved per person per week", "1 (conservative; the course page cites an hour or more)"], ["Loaded hourly rate (assumption, to confirm)", "£50"], ["Value recovered per week", "£1,250"], ["Value recovered per year (52 weeks)", "£65,000"], ["Training investment (25 × £1,250)", "£31,250"], ["Payback period", "about 25 weeks"]] },
        order: 5,
      },
      {
        id: crypto.randomUUID(),
        title: "Investment",
        type: "pricing_table",
        content: { tiers: [{ seats: "Course price (list, per participant)", price: 1600 }, { seats: "Discounted price for 25 participants", price: 1250 }] },
        order: 6,
      },
      {
        id: crypto.randomUUID(),
        title: "Total",
        type: "text",
        content: { body: "25 participants at the discounted price of £1,250 each: £31,250 in total. VAT is not applicable. Travel and accommodation are billed at cost and are not included in this price. The return figures are illustrative, based on the assumptions in the table; actual savings depend on role and adoption." },
        order: 7,
      },
      {
        id: crypto.randomUUID(),
        title: "What's included",
        type: "list",
        content: { items: ["Course materials for each participant", "A certificate of attendance for each participant (attendance only, not an accredited qualification)", "Office hours for support after the day", "Follow-up support by email after the day"] },
        order: 8,
      },
      {
        id: crypto.randomUUID(),
        title: "Next steps",
        type: "text",
        content: { body: "Confirm the date in the second half of November, the list of 25 participants and a contact at [Organisation]'s headquarters. We'll then confirm the agenda and logistics." },
        order: 9,
      },
    ],
  },
  expand_energy: {
    organisation: "Expand Energy",
    contact_name: "Jane Smith",
    contact_email: "jane.smith@expandenergy.com",
    contact_emails: ["jane.smith@expandenergy.com"],
    intro_note:
      "Thank you for the conversation regarding EHS training needs for your team. Below is our recommended AI & Safety Training programme, tailored to your specific requirements.",
    valid_until: "30",
    sections: [
      {
        id: crypto.randomUUID(),
        title: "Overview",
        type: "text",
        content: {
          body: "This comprehensive programme covers AI integration in EHS, safety culture development, and digital transformation for modern energy operations.",
        },
        order: 0,
      },
      {
        id: crypto.randomUUID(),
        title: "Program Modules",
        type: "list",
        content: {
          items: [
            "AI Fundamentals for EHS Professionals",
            "Digital Safety Management Systems",
            "Risk Assessment with AI Tools",
            "Safety Culture & Change Management",
            "Practical Implementation Workshop",
          ],
        },
        order: 1,
      },
      {
        id: crypto.randomUUID(),
        title: "Pricing",
        type: "pricing_table",
        content: {
          tiers: [
            { seats: "Up to 50 participants", price: 3500 },
            { seats: "51-100 participants", price: 3000 },
            { seats: "100+ participants", price: 2500 },
          ],
        },
        order: 2,
      },
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
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(",")[1];

          const { data, error } = await supabase.functions.invoke(
            "parse-proposal-document",
            {
              body: {
                fileData: base64,
                fileName: file.name,
              },
            }
          );

          if (error) {
            console.error("Edge function error:", error);
            throw new Error(error?.message || "Failed to parse document");
          }

          if (!data) {
            throw new Error("No response from parser");
          }

          console.log("Parsed data:", data);

          // Auto-fill the form with extracted data
          setForm({
            organisation: data.organisation || "",
            contact_name: data.contact_name || "",
            contact_email: data.contact_email || "",
            contact_emails: data.contact_email ? [data.contact_email] : [],
            intro_note: data.intro_note || "",
            valid_until: "30",
            sections: (data.sections || []).map((s: any, i: number) => ({
              ...s,
              id: crypto.randomUUID(),
              order: i,
            })),
          });

          toast.success(`✅ Proposal loaded! ${data.sections?.length || 0} sections extracted`);
        } catch (err) {
          console.error(err);
          toast.error("Failed to parse document. Please try again.");
        } finally {
          setUploading(false);
          event.target.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error("Failed to read file. Please try again.");
      setUploading(false);
      event.target.value = "";
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
          title: form.title || null,
          contact_name: form.contact_name || null,
          contact_role: form.contact_role || null,
          contact_email: form.contact_emails[0],
          contact_emails_json: form.contact_emails,
          intro_note: form.intro_note || null,
          valid_until: new Date(Date.now() + (parseInt(form.valid_until) || 30) * 86400000).toISOString().slice(0, 10),
          sections: JSON.parse(JSON.stringify(form.sections)),
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
          {/* Quick Start Options */}
          <div className="grid md:grid-cols-2 gap-3">
            {/* Upload Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex flex-col gap-2 cursor-pointer">
                <span className="text-sm font-semibold text-blue-900">📄 Upload Document</span>
                <span className="text-xs text-blue-700">Word or PDF file</span>
                <input
                  type="file"
                  accept=".docx,.doc,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="text-sm"
                />
              </label>
              {uploading && <p className="text-xs text-blue-600 mt-2">Parsing...</p>}
            </div>

            {/* Template Section */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-purple-900">🎯 Load Template</span>
                <span className="text-xs text-purple-700">Start with a preset</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setForm(proposalTemplates.expand_energy)}
                  className="bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                >
                  Expand Energy Template
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setForm(proposalTemplates.copilot_inperson_day)}
                  className="bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                >
                  Copilot in-person day (template)
                </Button>
              </div>
            </div>
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
