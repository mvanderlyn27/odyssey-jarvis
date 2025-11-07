import { supabase } from "@/lib/supabase/jarvisClient";
import { Profile } from "../types";

export const updateUserAccount = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
