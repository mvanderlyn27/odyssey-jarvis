import { supabase } from "../../../lib/supabase/jarvisClient";

export const fetchTikTokAccounts = async (userId: string | undefined) => {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase.from("tiktok_accounts").select("*").eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
