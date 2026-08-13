import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token") ?? "";
    let action = "view";
    let approverName = "";
    let approverNote = "";
    let decision = "";
    let email = String(url.searchParams.get("email") ?? "");

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      token = String(body.token ?? token);
      action = String(body.action ?? "view");
      approverName = String(body.approverName ?? "").slice(0, 120);
      approverNote = String(body.approverNote ?? "").slice(0, 1000);
      decision = String(body.decision ?? "");
      email = String(body.email ?? email);
    }

    if (!/^[a-f0-9]{16,64}$/i.test(token)) {
      return json({ error: "Invalid link" }, 400);
    }

    const { data: proposal, error } = await admin
      .from("proposals")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error) throw error;
    if (!proposal || proposal.status === "draft") {
      return json({ error: "Proposal not found" }, 404);
    }

    // Recipient verification: the visitor must know the email the proposal was sent to.
    const expected = String(proposal.contact_email ?? "").trim().toLowerCase();
    const provided = email.trim().toLowerCase().slice(0, 200);
    if (expected && provided !== expected) {
      const [user, domain] = expected.split("@");
      const maskedUser = user.length <= 2 ? user[0] + "*" : user[0] + "*".repeat(Math.max(1, user.length - 2)) + user[user.length - 1];
      return json({
        requiresEmail: true,
        hint: domain ? `${maskedUser}@${domain}` : null,
        error: provided ? "That email doesn't match the address this proposal was sent to." : null,
      });
    }

    if (action === "respond") {
      if (decision !== "approved" && decision !== "declined") {
        return json({ error: "Invalid decision" }, 400);
      }
      if (decision === "approved" && approverName.trim().length < 2) {
        return json({ error: "Please enter your full name" }, 400);
      }
      const { data: updated, error: upErr } = await admin
        .from("proposals")
        .update({
          status: decision,
          approver_name: approverName.trim() || null,
          approver_note: approverNote.trim() || null,
          responded_at: new Date().toISOString(),
        })
        .eq("id", proposal.id)
        .select("*")
        .single();
      if (upErr) throw upErr;

      // Notify the team of the decision
      try {
        const key = Deno.env.get("RESEND_API_KEY");
        if (key) {
          const total = (Array.isArray(proposal.items) ? proposal.items : []).reduce(
            (sum: number, i: Record<string, unknown>) =>
              sum + (Number(i.unitPrice) || 0) * (Number(i.seats) || 1),
            0,
          ) * (1 - (Number(proposal.discount_pct) || 0) / 100);
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "SafetyTech Academy <noreply@safetyacademy.tech>",
              to: ["lucas@getshield360.com"],
              subject: `Proposal ${decision}: ${proposal.organisation}`,
              html: `
                <h2>Proposal ${decision}</h2>
                <p><strong>Organisation:</strong> ${proposal.organisation}</p>
                <p><strong>Contact:</strong> ${proposal.contact_name ?? "-"} (${proposal.contact_email ?? "-"})</p>
                <p><strong>Responded by:</strong> ${approverName || "-"}</p>
                <p><strong>Note:</strong> ${approverNote || "-"}</p>
                <p><strong>Total (excl. VAT):</strong> £${total.toLocaleString("en-GB")}</p>
                <p><strong>Responded at:</strong> ${new Date().toLocaleString("en-GB")}</p>
              `,
            }),
          });
        }
      } catch (mailErr) {
        console.error("proposal notification email failed", mailErr);
      }

      return json({ proposal: updated });
    }

    await admin
      .from("proposals")
      .update({ view_count: (proposal.view_count ?? 0) + 1 })
      .eq("id", proposal.id);

    return json({ proposal });
  } catch (e) {
    console.error("proposal-public error", e);
    return json({ error: "Something went wrong" }, 500);
  }
});
