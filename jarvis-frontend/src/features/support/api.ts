import { supabase } from "@/lib/supabase/jarvisClient";

export type SubmitSupportRequestPayload = {
  name: string;
  email: string;
  message: string;
  user_id: string;
};

export const submitSupportRequest = async (payload: SubmitSupportRequestPayload) => {
  const { data, error } = await supabase.from("support_requests").insert([payload]).select();

  if (error) {
    throw error;
  }

  return data;
};
