import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the type for the account prop based on our DB schema
type TikTokAccount = {
  id: string;
  tiktok_username: string;
  tiktok_avatar_url: string;
  // Add other fields as needed
};

interface TikTokAccountCardProps {
  account: TikTokAccount;
}

const TikTokAccountCard: React.FC<TikTokAccountCardProps> = ({ account }) => {
  return (
    <Card className="w-full max-w-sm cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={account.tiktok_avatar_url} alt={`@${account.tiktok_username}`} />
            <AvatarFallback>{account.tiktok_username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{account.tiktok_username}</CardTitle>
            <a
              href={`https://www.tiktok.com/@${account.tiktok_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:underline"
              onClick={(e) => e.stopPropagation()} // Prevent card click when link is clicked
            >
              View on TikTok
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Placeholder for stats */}
        <div className="text-sm text-muted-foreground">
          <p>Followers: TBD</p>
          <p>Likes: TBD</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TikTokAccountCard;
