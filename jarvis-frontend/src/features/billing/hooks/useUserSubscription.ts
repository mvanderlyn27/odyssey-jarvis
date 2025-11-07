import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { useSession } from "@/features/auth/hooks/useSession";
import { getUserSubscription } from "../api/getUserSubscription";

export const useUserSubscription = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: queries.user.subscription(userId).queryKey,
    queryFn: () => {
      if (!userId) {
        throw new Error("User is not authenticated.");
      }
      return getUserSubscription(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};
