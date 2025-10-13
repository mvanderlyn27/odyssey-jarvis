import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { TikTokAccount } from "@/features/tiktok/types";
import { useTikTokStats } from "@/features/tiktok/hooks/useTikTokStats";

interface TikTokAccountCardProps {
  account: TikTokAccount;
  onReauthenticate: () => void;
}

const TikTokAccountCard: React.FC<TikTokAccountCardProps> = ({ account, onReauthenticate }) => {
  const { data: stats, isLoading } = useTikTokStats(account);

  return (
    <Link to={`/tiktok/${account.tiktok_open_id}`}>
      <Card className="w-full max-w-sm cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={account.tiktok_avatar_url ?? undefined} alt={`@${account.tiktok_username}`} />
              <AvatarFallback>{account.tiktok_username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{account.tiktok_display_name}</CardTitle>
              <a
                href={`https://www.tiktok.com/@${account.tiktok_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:underline"
                onClick={(e) => e.stopPropagation()}>
                @{account.tiktok_username}
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {account.token_status === "expired" ? (
              <div className="flex items-center justify-between">
                <p className="text-red-600">Token expired.</p>
                <Button variant="outline" size="sm" onClick={onReauthenticate}>
                  Re-authenticate
                </Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12 justify-self-end" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12 justify-self-end" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12 justify-self-end" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12 justify-self-end" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <p>Followers:</p>
                <p className="text-right">{stats.follower_count?.toLocaleString() ?? "N/A"}</p>
                <p>Following:</p>
                <p className="text-right">{stats.following_count?.toLocaleString() ?? "N/A"}</p>
                <p>Likes:</p>
                <p className="text-right">{stats.likes_count?.toLocaleString() ?? "N/A"}</p>
                <p>Videos:</p>
                <p className="text-right">{stats.video_count?.toLocaleString() ?? "N/A"}</p>
              </div>
            ) : (
              <p>Could not load stats.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TikTokAccountCard;
