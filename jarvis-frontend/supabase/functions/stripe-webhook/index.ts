import { serve } from "https://deno.land/std@0.177.1/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";

console.log(`Function "stripe-webhook" up and running!`);

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

const relevantEvents = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

serve(async (req: Request) => {
  const signature = req.headers.get("Stripe-Signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing Stripe-Signature header." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);

    if (relevantEvents.has(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const customer = await stripe.customers.retrieve(customerId);
      const userId = (customer as Stripe.Customer).metadata.user_id;

      if (!userId) {
        throw new Error("User ID not found in customer metadata.");
      }

      const stripeProductId = subscription.items.data[0].price.product as string;
      const { data: plan, error: planError } = await supabaseAdmin
        .from("plans")
        .select("id")
        .eq("stripe_product_id", stripeProductId)
        .single();

      if (planError || !plan) {
        throw new Error(`Plan with stripe_product_id ${stripeProductId} not found.`);
      }

      const subscriptionData = {
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        plan_id: plan.id,
        start_date: new Date((subscription.start_date || subscription.created) * 1000).toISOString(),
        trial_starts_at: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        current_period_ends_at: new Date(
          (subscription.current_period_end || subscription.created) * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
      };

      const { error: subscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .upsert({ user_id: userId, ...subscriptionData }, { onConflict: "stripe_subscription_id" });

      if (subscriptionError) {
        console.error("Error upserting subscription:", subscriptionError);
        throw new Error("Could not update subscription in database.");
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("onboarding_data")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Could not fetch user profile.");
      }

      const updatedOnboardingData = {
        ...(profile.onboarding_data as Record<string, unknown>),
        hasCompletedPurchase: true,
      };

      const { error: updateProfileError } = await supabaseAdmin
        .from("profiles")
        .update({ onboarding_data: updatedOnboardingData })
        .eq("id", userId);

      if (updateProfileError) {
        console.error("Error updating profile:", updateProfileError);
        throw new Error("Could not update user profile.");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log(`Stripe webhook error: ${errorMessage}`);
    return new Response(JSON.stringify({ error: `Webhook error: ${errorMessage}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
