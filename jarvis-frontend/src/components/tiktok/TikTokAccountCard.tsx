import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { TikTokAccount } from "@/features/tiktok/types";

interface TikTokAccountCardProps {
  account: TikTokAccount;
  onReauthenticate: () => void;
  onRemove: () => void;
}

const TikTokAccountCard: React.FC<TikTokAccountCardProps> = ({ account, onReauthenticate, onRemove }) => {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove();
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Link to={`/tiktok/${account.tiktok_open_id}`} className="w-full">
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
        </Link>
      </CardHeader>
      <CardContent>
        <Link to={`/tiktok/${account.tiktok_open_id}`} className="w-full">
          <div className="text-sm text-muted-foreground">
            {account.token_status === "expired" ? (
              <div className="flex items-center justify-between">
                <p className="text-red-600">Token expired.</p>
                <Button variant="outline" size="sm" onClick={onReauthenticate}>
                  Re-authenticate
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <p>Followers:</p>
                <p className="text-right">{account.follower_count?.toLocaleString() ?? "N/A"}</p>
                <p>Following:</p>
                <p className="text-right">{account.following_count?.toLocaleString() ?? "N/A"}</p>
                <p>Likes:</p>
                <p className="text-right">{account.likes_count?.toLocaleString() ?? "N/A"}</p>
                <p>Videos:</p>
                <p className="text-right">{account.video_count?.toLocaleString() ?? "N/A"}</p>
              </div>
            )}
          </div>
        </Link>
        <div className="mt-4 flex justify-end">
          <Button variant="destructive" size="sm" onClick={handleRemoveClick}>
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TikTokAccountCard;
