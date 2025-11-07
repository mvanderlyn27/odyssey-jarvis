import { supabase } from "@/lib/supabase/jarvisClient";
import { AdminDashboardStats } from "../types";

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats[]> => {
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

  if (error) {
    console.error("Error fetching admin dashboard stats:", error);
    throw error;
  }

  return data;
};
