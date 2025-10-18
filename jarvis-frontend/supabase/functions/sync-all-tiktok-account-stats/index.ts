import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateRequest } from "../_shared/auth.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  try {
    const { error: authError } = await authenticateRequest(req);
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log("Starting sync for all TikTok accounts...");
    const { data: accounts, error: accountsError } = await supabase.from("tiktok_accounts").select("id");

    if (accountsError) {
      throw new Error(`Failed to fetch accounts: ${accountsError.message}`);
    }

    console.log(`Found ${accounts.length} accounts to sync.`);

    const batchSize = 2;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < accounts.length; i += batchSize) {
      const batch = accounts.slice(i, i + batchSize);
      console.log(`Processing batch of ${batch.length} accounts...`);
      const syncPromises = batch.map((account) =>
        fetch(`${supabaseUrl}/functions/v1/sync-tiktok-account-stats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Secret": Deno.env.get("INTERNAL_SECRET_KEY"),
          },
          body: JSON.stringify({ accountId: account.id }),
        })
      );

      const results = await Promise.allSettled(syncPromises);

      for (const [index, result] of results.entries()) {
        const account = batch[index];
        if (result.status === "rejected") {
          console.error(`Failed to sync stats for account ${account.id}:`, result.reason);
          failureCount++;
        } else if (!result.value.ok) {
          const errorBody = await result.value.json();
          console.error(`Failed to sync stats for account ${account.id}: Edge function returned non-2xx status`, {
            status: result.value.status,
            statusText: result.value.statusText,
            error: errorBody,
          });
          failureCount++;
        } else {
          successCount++;
        }
      }
    }

    console.log(`Sync finished. Successful: ${successCount}, Failed: ${failureCount}`);

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
