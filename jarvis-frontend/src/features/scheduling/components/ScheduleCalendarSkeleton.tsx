import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const ScheduleCalendarSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <CardTitle>Post Schedule</CardTitle>
        <Skeleton className="h-8 w-8 ml-2 rounded-md" />
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="grid grid-cols-[100px_repeat(14,minmax(280px,1fr))]">
          {/* Header Row Skeleton */}
          <div className="sticky left-0 z-30 p-2 font-semibold text-center bg-card"></div>
          {Array.from({ length: 14 }).map((_, index) => (
            <div key={index} className="p-2 mb-2 font-semibold text-center">
              <Skeleton className="h-4 w-10 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto mt-1" />
            </div>
          ))}

          {/* Account Rows Skeleton */}
          {Array.from({ length: 5 }).map((_, accountIndex) => (
            <React.Fragment key={accountIndex}>
              <div className="sticky left-0 z-30 flex flex-col items-center justify-center py-2 pl-0 pr-2 space-y-1 border-t bg-card">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
              {Array.from({ length: 14 }).map((_, dayIndex) => (
                <div key={dayIndex} className="flex p-2 space-x-2 border-t">
                  <Skeleton className="h-48 w-full rounded-md" />
                  <Skeleton className="h-48 w-full rounded-md" />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendarSkeleton;
