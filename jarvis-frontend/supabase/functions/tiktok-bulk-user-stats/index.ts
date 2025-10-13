/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { accessTokens } = await req.json();

    if (!accessTokens || !Array.isArray(accessTokens) || accessTokens.length === 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid accessTokens" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const authorization = req.headers.get("Authorization")!;

    const statsPromises = accessTokens.map((accessToken: string) =>
      supabase.functions.invoke("tiktok-user-stats", {
        body: { access_token: accessToken },
        headers: {
          Authorization: authorization,
        },
      })
    );

    const statsResults = await Promise.all(statsPromises);

    // Process results, extracting data and handling errors
    const allStats = statsResults.map((result: any) => {
      if (result.error) {
        console.error("Error fetching stats for an account:", result.error);
        return { error: result.error.message }; // Return error info
      }
      // The actual stats are nested under the 'data' property from the invoked function
      return result.data?.data;
    });

    return new Response(JSON.stringify({ stats: allStats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
