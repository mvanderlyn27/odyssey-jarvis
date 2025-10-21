import { supabase } from "@/lib/supabase/jarvisClient";
import { useMutation } from "@tanstack/react-query";

export const refreshPostDetails = async (postId: string) => {
  const { data, error } = await supabase.functions.invoke("tiktok-refresh-post-details", {
    body: { id: postId },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useRefreshPost = () => {
  return useMutation({
    mutationFn: refreshPostDetails,
  });
};
