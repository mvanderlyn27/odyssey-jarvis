import { supabase } from "@/lib/supabase/jarvisClient";
import { getPlan } from "@/features/billing/api";

export const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/app/home`,
    },
  });
};

export const signUpWithGoogle = async (priceId: string | null) => {
  if (priceId) {
    localStorage.setItem("pendingPurchase", JSON.stringify({ priceId }));
    const plan = await getPlan(priceId);
    if (plan.price === 0) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/purchase-complete?status=success`,
        },
      });
      return;
    }
  }

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/checkout?priceId=${priceId}`,
    },
  });
};
