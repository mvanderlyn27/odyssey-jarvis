import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserAccount } from "../api/getUserAccount";

export const useUserAccount = () => {
  const { session } = useAuthStore();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ["userAccount", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User is not authenticated.");
      }
      return getUserAccount(userId);
    },
    enabled: !!userId, // The query will not run until the userId is available
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};
