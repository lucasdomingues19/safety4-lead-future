import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";
import { applyAttemptResult, callSyngraph, verifySyngraphSignature, type SyngraphAttempt } from "../_shared/syngraph.ts";

// Receives Syngraph's signed "attempt.completed" callback for final
// assessments. The signature proves it came from Syngraph for our API key; we
// still re-read the result from Syngraph's API before recording it, so even a
// replayed or reordered callback can only ever write the true, current result.

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const raw = await req.text();
  if (!(await verifySyngraphSignature(raw, req.headers.get("Syngraph-Signature")))) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const event = JSON.parse(raw) as { event?: string; launchId?: string; externalRef?: string };
    if (event.event !== "attempt.completed" || !event.launchId) return new Response(JSON.stringify({ ignored: true }), { status: 200 });

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: row } = await db.from("final_assessment_attempts").select("*").eq("syngraph_launch_id", event.launchId).maybeSingle();
    if (!row || (event.externalRef && event.externalRef !== row.id)) {
      return new Response(JSON.stringify({ ignored: true, reason: "unknown launch" }), { status: 200 });
    }

    const { attempt } = await callSyngraph<{ attempt: SyngraphAttempt | null }>("api-get-attempt", { launchId: event.launchId });
    if (attempt) await applyAttemptResult(db, row, attempt);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("syngraph-webhook error", (e as Error).message);
    // 500 lets Syngraph retry.
    return new Response(JSON.stringify({ error: "Could not process" }), { status: 500 });
  }
});
