import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { queries } from "@/lib/queries";
import { supabase } from "@/lib/supabase/jarvisClient";

const fetchDrafts = async (userId: string | undefined) => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("drafts")
    .select(
      `
      *,
      draft_assets (*)
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching drafts:", error);
    throw new Error(error.message);
  }

  return data;
};

export const fetchDraft = async (draftId: string) => {
  const { data, error } = await supabase
    .from("drafts")
    .select(
      `
      *,
      draft_assets (*)
    `
    )
    .eq("id", draftId)
    .single();

  if (error) {
    console.error("Error fetching draft:", error);
    throw new Error(error.message);
  }

  return data;
};

export const useDrafts = () => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;

  return useQuery({
    ...queries.drafts.all(userId!),
    queryFn: () => fetchDrafts(userId),
    enabled: !!userId,
  });
};
