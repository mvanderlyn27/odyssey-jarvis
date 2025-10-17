import { Button, ButtonProps } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps extends ButtonProps {
  isRefreshing: boolean;
}

export const RefreshButton = ({ isRefreshing, onClick, ...props }: RefreshButtonProps) => {
  return (
    <Button onClick={onClick} disabled={isRefreshing} {...props}>
      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </Button>
  );
};
