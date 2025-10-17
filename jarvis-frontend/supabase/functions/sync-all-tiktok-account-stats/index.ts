import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (_req) => {
  try {
    const { data: accounts, error: accountsError } = await supabase.from("tiktok_accounts").select("id");

    if (accountsError) {
      throw new Error(`Failed to fetch accounts: ${accountsError.message}`);
    }

    const syncPromises = accounts.map((account) =>
      fetch(`${supabaseUrl}/functions/v1/sync-tiktok-account-stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({ accountId: account.id }),
      })
    );

    const results = await Promise.allSettled(syncPromises);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Failed to sync stats for account ${accounts[index].id}:`, result.reason);
      } else if (!result.value.ok) {
        console.error(`Failed to sync stats for account ${accounts[index].id}: Edge function returned non-2xx status`, {
          status: result.value.status,
          statusText: result.value.statusText,
        });
      }
    });

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
