import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVENT_COLUMN: Record<string, string> = {
  viewed: "viewed_at",
  engaged: "engaged_at",
  linkedin: "linkedin_added_at",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { certificateNumber, event } = await req.json();

    if (
      !certificateNumber ||
      typeof certificateNumber !== "string" ||
      certificateNumber.length > 100
    ) {
      return new Response(JSON.stringify({ error: "Invalid certificate number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const column = EVENT_COLUMN[event];
    if (!column) {
      return new Response(JSON.stringify({ error: "Invalid event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find the certificate
    const { data: cert, error: fetchErr } = await supabase
      .from("certificates")
      .select(`id, ${column}`)
      .eq("certificate_number", certificateNumber)
      .maybeSingle();

    if (fetchErr || !cert) {
      // Silently succeed to avoid leaking which certificate numbers exist
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only record the FIRST time an interaction happens
    if (!(cert as Record<string, unknown>)[column]) {
      await supabase
        .from("certificates")
        .update({ [column]: new Date().toISOString() })
        .eq("id", (cert as { id: string }).id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error tracking certificate interaction:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
