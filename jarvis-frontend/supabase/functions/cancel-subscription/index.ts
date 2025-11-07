import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateRequest } from "../_shared/auth.ts";

console.log(`Function "cancel-subscription" up and running!`);

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user, error: authError } = await authenticateRequest(req);
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error("Failed to fetch user profile.");
    }

    let query = supabaseAdmin.from("subscriptions").select("stripe_subscription_id");

    if (profile.organization_id) {
      query = query.or(`user_id.eq.${user.id},organization_id.eq.${profile.organization_id}`);
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data: subscription, error: subscriptionError } = await query.single();

    if (subscriptionError || !subscription) {
      console.error("Error fetching subscription:", subscriptionError);
      return new Response(JSON.stringify({ error: "Subscription not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const canceledSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        status: "active", // The subscription is still active until the period end
      })
      .eq("stripe_subscription_id", subscription.stripe_subscription_id);

    if (updateError) {
      console.error("Error updating subscription in database:", updateError);
      // Even if this fails, the subscription is canceled in Stripe.
      // The webhook will eventually sync the correct state.
    }

    return new Response(JSON.stringify(canceledSubscription), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
