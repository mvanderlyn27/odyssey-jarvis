import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TikTokAccount } from "@/features/tiktok/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface TikTokAccountCardProps {
  account: TikTokAccount;
  onRemove: () => void;
  isLoading: boolean;
}

export const TikTokAccountCard: React.FC<TikTokAccountCardProps> = ({ account, onRemove, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-3 w-20 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={`/tiktok/${account.id}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{account.tiktok_display_name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <img src={account.tiktok_avatar_url || ""} alt="Avatar" className="w-8 h-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">@{account.tiktok_username}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
            <p>Followers:</p>
            <p className="text-right">{(account.follower_count || 0).toLocaleString()}</p>
            <p>Following:</p>
            <p className="text-right">{(account.following_count || 0).toLocaleString()}</p>
            <p>Likes:</p>
            <p className="text-right">{(account.likes_count || 0).toLocaleString()}</p>
            <p>Videos:</p>
            <p className="text-right">{(account.video_count || 0).toLocaleString()}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Token Status: {account.token_status}</p>
        </CardContent>
      </Card>
    </Link>
  );
};
