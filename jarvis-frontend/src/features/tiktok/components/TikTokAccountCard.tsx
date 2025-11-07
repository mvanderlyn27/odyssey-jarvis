import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TikTokAccount } from "@/features/tiktok/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { TikTokAccountCardSkeleton } from "./TikTokAccountCardSkeleton";

interface TikTokAccountCardProps {
  account: TikTokAccount;
  onRemove: () => void;
  isLoading: boolean;
}

export const TikTokAccountCard: React.FC<TikTokAccountCardProps> = ({ account, onRemove, isLoading }) => {
  if (isLoading) {
    return <TikTokAccountCardSkeleton />;
  }

  return (
    <Link to={`/app/tiktok/${account.id}`} className="w-full max-w-sm">
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
          <img src={account.profile_image_url || ""} alt="Avatar" className="w-24 h-24 rounded-full" />
          <CardTitle className="text-lg font-bold mt-4">{account.display_name}</CardTitle>
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
