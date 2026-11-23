// Public: one-click unsubscribe from SafetyTech Academy marketing email.
// GET shows a confirmation page; POST (List-Unsubscribe-Post one-click) returns 200.
// Only signed links (see _shared/marketingUnsub.ts) are accepted.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { verifyMarketingUnsub } from "../_shared/marketingUnsub.ts";

const page = (title: string, msg: string, status = 200) =>
  new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;"><div style="max-width:460px;margin:60px auto;background:#fff;border-radius:14px;padding:32px;color:#1e293b;line-height:1.6"><h1 style="font-size:20px;color:#0b0b2c;margin:0 0 10px">${title}</h1><p style="margin:0 0 18px">${msg}</p><a href="https://www.safetytech.academy" style="color:#3434ff;font-weight:700">Go to SafetyTech Academy</a></div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } });

serve(async (req) => {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") ?? "").trim().toLowerCase();
  const token = url.searchParams.get("t") ?? "";
  if (!(await verifyMarketingUnsub(email, token))) {
    return page("Link not recognised", "This unsubscribe link is incomplete or has been changed. Reply to any of our emails and we will remove you by hand.", 400);
  }
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error } = await db.from("marketing_unsubscribes").upsert({ email, source: req.method === "POST" ? "one-click" : "link" }, { onConflict: "email", ignoreDuplicates: true });
  if (error) {
    console.error("[marketing-unsubscribe]", error.message);
    return page("Something went wrong", "We could not record that just now. Please try the link again, or reply to the email and we will remove you by hand.", 500);
  }
  await db.from("profiles").update({ marketing_opt_in: false }).ilike("email", email);
  if (req.method === "POST") return new Response("ok");
  return page("You are unsubscribed", `We will not send marketing emails to ${email.replace(/[<>&"]/g, "")} again. You will still get emails about courses you are enrolled in.`);
});
