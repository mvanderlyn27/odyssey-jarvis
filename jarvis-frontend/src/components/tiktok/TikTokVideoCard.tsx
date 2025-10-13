import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TikTokVideo } from "@/features/tiktok/types";

interface TikTokVideoCardProps {
  video: TikTokVideo;
}

export const TikTokVideoCard: React.FC<TikTokVideoCardProps> = ({ video }) => {
  return (
    <Card className="w-full max-w-sm cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <img src={video.cover_image_url} alt={video.title} className="rounded-lg" />
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg font-bold truncate">{video.title}</CardTitle>
        <p className="text-sm text-muted-foreground truncate">{video.video_description}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
          <p>Views:</p>
          <p className="text-right">{video.view_count.toLocaleString()}</p>
          <p>Likes:</p>
          <p className="text-right">{video.like_count.toLocaleString()}</p>
          <p>Comments:</p>
          <p className="text-right">{video.comment_count.toLocaleString()}</p>
          <p>Shares:</p>
          <p className="text-right">{video.share_count.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};
