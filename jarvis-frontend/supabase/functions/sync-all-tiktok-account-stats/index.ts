import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (_req) => {
  try {
    const { data: accounts, error: accountsError } = await supabase.from("tiktok_accounts").select("id");

    if (accountsError) {
      throw new Error(`Failed to fetch accounts: ${accountsError.message}`);
    }

    for (const account of accounts) {
      const { error: invokeError } = await supabase.functions.invoke("sync-tiktok-account-stats", {
        body: { accountId: account.id },
      });

      if (invokeError) {
        console.error(`Failed to sync stats for account ${account.id}:`, invokeError);
      }
    }

    return new Response("OK", {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
