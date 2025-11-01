import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

      // Get user_id from customer metadata
      const customer = await stripe.customers.retrieve(customerId);
      const userId = (customer as Stripe.Customer).metadata.user_id;

      if (!userId) {
        throw new Error("User ID not found in customer metadata.");
      }

      const subscriptionData = {
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        plan_id: subscription.items.data[0].price.lookup_key,
        trial_starts_at: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        current_period_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
      };

      const { error } = await supabaseAdmin
        .from("subscriptions")
        .upsert({ user_id: userId, ...subscriptionData }, { onConflict: "stripe_subscription_id" });

      if (error) {
        console.error("Error upserting subscription:", error);
        throw new Error("Could not update subscription in database.");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: `Webhook error: ${error.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
