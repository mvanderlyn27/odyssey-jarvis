import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTikTokAccountAnalytics } from "../hooks/useTikTokAccountAnalytics";

interface AccountAnalyticsKPIsProps {
  accountId: string | undefined;
}

export const AccountAnalyticsKPIs = ({ accountId }: AccountAnalyticsKPIsProps) => {
  const { data: accountAnalytics, isLoading } = useTikTokAccountAnalytics(accountId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Followers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{accountAnalytics?.follower_count?.toLocaleString() ?? "N/A"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Following</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{accountAnalytics?.following_count?.toLocaleString() ?? "N/A"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Likes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{accountAnalytics?.likes_count?.toLocaleString() ?? "N/A"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{accountAnalytics?.video_count?.toLocaleString() ?? "N/A"}</p>
        </CardContent>
      </Card>
    </div>
  );
};
