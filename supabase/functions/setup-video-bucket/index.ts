import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Create the video-lessons bucket
    const { data, error } = await supabase.storage.createBucket("video-lessons", {
      public: true,
    });

    if (error) {
      // If bucket already exists, that's OK
      if (error.message?.includes("already exists")) {
        return new Response(
          JSON.stringify({ message: "Bucket already exists", bucket: "video-lessons" }),
          { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
        );
      }
      throw error;
    }

    return new Response(JSON.stringify({ message: "Bucket created successfully", data }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 201,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 400,
    });
  }
});
