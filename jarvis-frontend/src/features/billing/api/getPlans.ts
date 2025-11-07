import { supabase } from "@/lib/supabase/jarvisClient";
import { Plan } from "../types";

export const getPlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase.from("plans").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data as Plan[];
};
