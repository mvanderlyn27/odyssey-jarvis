import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const TikTokAccountCardSkeleton: React.FC = () => {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex flex-col items-center p-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-6 w-32 mt-4" />
        <Skeleton className="h-4 w-24 mt-2" />
        <div className="grid grid-cols-3 gap-x-8 gap-y-2 mt-4 text-sm">
          <div className="flex flex-col items-center space-y-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
