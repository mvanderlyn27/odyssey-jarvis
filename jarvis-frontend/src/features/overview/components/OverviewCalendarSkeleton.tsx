import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OverviewCalendarSkeleton = () => {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="space-x-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 text-center font-semibold min-w-[1000px]">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-16 mx-auto" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2 min-w-[1000px]">
          {Array.from({ length: 42 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewCalendarSkeleton;
