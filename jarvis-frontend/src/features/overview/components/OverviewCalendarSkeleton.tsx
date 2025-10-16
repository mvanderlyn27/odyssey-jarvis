import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OverviewCalendarSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-8 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 border rounded-md p-2">
              <Skeleton className="h-4 w-8 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewCalendarSkeleton;
