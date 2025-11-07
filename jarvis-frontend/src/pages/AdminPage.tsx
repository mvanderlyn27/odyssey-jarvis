import { PageHeader } from "@/components/layout/PageHeader";
import { useAdminDashboardStats } from "../features/admin/hooks/useAdminDashboardStats";
import { OrganizationStatsTable } from "../features/admin/components/OrganizationStatsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminPage = () => {
  const { data: stats, isLoading, isError, error } = useAdminDashboardStats();

  return (
    <div className="p-6 space-y-8">
      <PageHeader title="Admin Dashboard" />
      <div className="max-w-[80vw] mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Organization Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <Skeleton className="h-64 w-full" />}
            {isError && <p className="text-red-600">{error?.message}</p>}
            {stats && <OrganizationStatsTable stats={stats} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
