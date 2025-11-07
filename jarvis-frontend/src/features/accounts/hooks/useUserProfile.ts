import { useQuery } from "@tanstack/react-query";
import { getUserAccount } from "../api/getUserAccount";
import { queries } from "@/lib/queries";
import { useSession } from "@/features/auth/hooks/useSession";

export const useUserProfile = (userId?: string) => {
  const { data: session } = useSession();
  const id = userId || session?.user?.id;

  return useQuery({
    queryKey: queries.user.account(id).queryKey,
    queryFn: () => {
      if (!id) {
        throw new Error("User is not authenticated.");
      }
      return getUserAccount(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};
