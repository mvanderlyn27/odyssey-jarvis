import { supabase } from "@/lib/supabase/jarvisClient";

export const checkUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase.from("profiles").select("id").eq("id", userId).single();
  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    throw error;
  }
  return profile;
};

export const getPlan = async (planId: string) => {
  const { data, error } = await supabase.from("plans").select("*").eq("id", planId).single();
  if (error) {
    throw error;
  }
  return data;
};

export const createCheckoutSession = async (priceId: string, returnUrl: string) => {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: {
      priceId,
      returnUrl,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};
