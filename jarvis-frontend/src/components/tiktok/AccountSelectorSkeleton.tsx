import { Skeleton } from "@/components/ui/skeleton";

const AccountSelectorSkeleton = () => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountSelectorSkeleton;
