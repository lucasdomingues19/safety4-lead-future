// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripeRequest } from "../_shared/stripe.ts";
serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("LIFECYCLE_CRON_SECRET")) return new Response("no", { status: 401 });
  const b = await req.json().catch(() => ({})) as any;
  try {
    if (b.action === "inspect") {
      const l = await stripeRequest<any>("GET", "/payment_links/plink_1UZrIM7TIxBshEUiiqCdduM3");
      const { url: _u, ...rest } = l; return Response.json(rest);
    }
    if (b.action === "update") return Response.json(await stripeRequest<any>("POST", "/payment_links/plink_1UZrIM7TIxBshEUiiqCdduM3", b.params));
    return Response.json({ error: "unknown" }, { status: 400 });
  } catch (e) { return Response.json({ error: (e as Error).message }, { status: 500 }); }
});
