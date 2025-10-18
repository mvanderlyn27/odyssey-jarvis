import { Skeleton } from "@/components/ui/skeleton";
import { useTikTokAccountAnalytics } from "../hooks/useTikTokAccountAnalytics";

interface AccountAnalyticsKPIsProps {
  accountId: string | undefined;
}

const KPI = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col items-center">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

export const AccountAnalyticsKPIs = ({ accountId }: AccountAnalyticsKPIsProps) => {
  const { data: accountAnalytics, isLoading } = useTikTokAccountAnalytics(accountId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-y-4">
      <KPI label="Followers" value={accountAnalytics?.follower_count?.toLocaleString() ?? "N/A"} />
      <KPI label="Following" value={accountAnalytics?.following_count?.toLocaleString() ?? "N/A"} />
      <KPI label="Likes" value={accountAnalytics?.likes_count?.toLocaleString() ?? "N/A"} />
      <KPI label="Videos" value={accountAnalytics?.video_count?.toLocaleString() ?? "N/A"} />
    </div>
  );
};
