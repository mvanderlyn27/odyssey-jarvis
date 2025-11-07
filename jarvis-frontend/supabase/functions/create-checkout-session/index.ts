import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";
import { authenticateRequest } from "../_shared/auth.ts";

console.log(`Function "create-checkout-session" up and running!`);

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

    const { priceId, returnUrl } = await req.json();
    if (!priceId || !returnUrl) {
      return new Response(JSON.stringify({ error: "Missing priceId or returnUrl." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("stripe_price_id")
      .eq("id", priceId)
      .single();

    if (planError) {
      console.error("Error fetching plan:", planError);
      throw new Error("Could not fetch plan.");
    }

    if (!plan.stripe_price_id) {
      throw new Error("Stripe price ID not found for the selected plan.");
    }

    // Get or create a Stripe customer
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError);
      throw new Error("Could not fetch user profile.");
    }

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating profile with Stripe customer ID:", updateError);
        throw new Error("Could not update user profile with Stripe customer ID.");
      }
    }

    // Check if the user already has an active subscription
    const { data: existingSubscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id")
      .in("status", ["trialing", "active"])
      .eq("user_id", user.id)
      .single();

    if (subError && subError.code !== "PGRST116") {
      console.error("Error fetching existing subscription:", subError);
      throw new Error("Could not fetch existing subscription.");
    }

    if (existingSubscription) {
      // User has an active subscription, create a billing portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create a checkout session with a trial period
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
      },
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
