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
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center p-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 mt-4" />
          <Skeleton className="h-4 w-24 mt-2" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={`/tiktok/${account.id}`} className="w-full max-w-sm">
      <Card className="transition-transform duration-200 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-end space-y-0 p-2">
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
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-0 p-6">
          <img src={account.tiktok_avatar_url || ""} alt="Avatar" className="w-24 h-24 rounded-full" />
          <CardTitle className="text-lg font-bold mt-4">{account.tiktok_display_name}</CardTitle>
          <p className="text-sm text-muted-foreground">@{account.tiktok_username}</p>
          <div className="grid grid-cols-3 gap-x-8 gap-y-2 mt-4 text-sm text-center">
            <div>
              <p className="font-semibold">{(account.follower_count || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-semibold">{(account.likes_count || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div>
              <p className="font-semibold">{(account.video_count || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
