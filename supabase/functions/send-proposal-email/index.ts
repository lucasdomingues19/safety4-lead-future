import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

interface ProposalSection {
  id: string;
  title: string;
  type: "text" | "table" | "list" | "roi_table" | "pricing_table";
  content: Record<string, any>;
  order: number;
}

interface ProposalRequest {
  proposal: {
    organisation: string;
    contact_name: string;
    contact_emails: string[];
    intro_note: string;
    valid_until: string | number;
    sections: ProposalSection[];
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { proposal } = (await req.json()) as ProposalRequest;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const client = createClient(supabaseUrl, supabaseKey);

    // Generate token for viewing
    const token = crypto.getRandomValues(new Uint8Array(16));
    const tokenStr = Array.from(token)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Save proposal to database
    const { data: saved, error: saveError } = await client
      .from("proposals")
      .insert({
        organisation: proposal.organisation,
        contact_name: proposal.contact_name,
        contact_email: proposal.contact_emails[0],
        contact_emails_json: proposal.contact_emails,
        intro_note: proposal.intro_note,
        valid_until: parseInt(String(proposal.valid_until)) || 30,
        sections: proposal.sections,
        proposal_type: "bespoke",
        status: "sent",
        token: tokenStr,
      })
      .select();

    if (saveError) {
      console.error("Save error:", saveError);
      throw new Error(`Failed to save proposal: ${saveError.message}`);
    }

    const proposalId = saved?.[0]?.id;
    const proposalUrl = `${supabaseUrl.replace('/rest/v1', '')}/project/${proposalId}/proposal/${tokenStr}`;

    // Send to each recipient
    const emailPromises = proposal.contact_emails.map((email) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "proposals@safetytech.academy",
          to: email,
          subject: `Proposal for ${proposal.organisation} - SafetyTech Academy`,
          html: `
            <h2>Proposal for ${proposal.organisation}</h2>
            <p>Hi ${proposal.contact_name || "there"},</p>
            ${
              proposal.intro_note
                ? `<p>${proposal.intro_note.replace(/\n/g, "<br>")}</p>`
                : ""
            }
            <p><a href="${proposalUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block;">View Full Proposal</a></p>
            <p>Valid for ${proposal.valid_until} days.</p>
            <p>Best regards,<br>Lucas Domingues<br>Founder, SafetyTech Academy</p>
          `,
        }),
      })
    );

    const results = await Promise.all(emailPromises);

    // Check all emails sent successfully
    for (const result of results) {
      if (!result.ok) {
        throw new Error(`Email send failed: ${result.statusText}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        proposal_id: proposalId,
        recipients: proposal.contact_emails.length,
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      }
    );
  }
});
