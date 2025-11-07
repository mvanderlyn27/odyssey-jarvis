import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "../api";
import { queries } from "@/lib/queries";

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: queries.admin.dashboardStats.queryKey,
    queryFn: getAdminDashboardStats,
  });
};
