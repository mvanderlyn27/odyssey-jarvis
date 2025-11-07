import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SchedulerPostCardSkeleton = () => {
  return (
    <div className="w-28 h-36">
      <Card className="overflow-hidden h-full w-full bg-background border rounded-lg">
        <Skeleton className="w-full h-full" />
      </Card>
    </div>
  );
};

export default SchedulerPostCardSkeleton;
