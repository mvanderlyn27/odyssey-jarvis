import { Card, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEditPostStore } from "@/store/useEditPostStore";
import { Post } from "../types";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, Eye } from "lucide-react";
import { SignedUrlImage } from "@/components/shared/SignedUrlImage";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { post: activePost, isDirty } = useEditPostStore() as any;
  const latestAnalytics = post.post_analytics?.[0];
  const firstAsset = post.post_assets?.[0];

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "FAILED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const renderThumbnail = () => {
    if (!firstAsset) {
      return <div className="flex items-center justify-center h-full">No assets</div>;
    }

    return (
      <SignedUrlImage
        thumbnailPath={firstAsset.thumbnail_path}
        fullSizePath={firstAsset.asset_url}
        blurhash={firstAsset.blurhash}
        size="large"
      />
    );
  };

  return (
    <Link to={`/posts/${post.id}`} key={post.id}>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="aspect-[9/16] bg-gray-200">{renderThumbnail()}</div>
        <div className="p-4 flex flex-col flex-grow">
          <CardTitle className="truncate text-sm font-bold mb-2">{post.title || "Untitled Post"}</CardTitle>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            {post.tiktok_accounts && (
              <div className="flex items-center">
                <img
                  src={post.tiktok_accounts.tiktok_avatar_url || ""}
                  alt={post.tiktok_accounts.tiktok_display_name || ""}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="truncate font-medium">{post.tiktok_accounts.tiktok_display_name}</span>
              </div>
            )}
            <Badge variant={getStatusVariant(post.status || "")}>{post.status}</Badge>
          </div>
          {latestAnalytics && (
            <div className="grid grid-cols-2 gap-2 text-xs mt-auto text-muted-foreground">
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                <span>{(latestAnalytics.views || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                <span>{(latestAnalytics.likes || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-3 h-3 mr-1" />
                <span>{(latestAnalytics.comments || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Send className="w-3 h-3 mr-1" />
                <span>{(latestAnalytics.shares || 0).toLocaleString()}</span>
              </div>
            </div>
          )}
          {activePost?.id === post.id && isDirty && (
            <Badge variant="outline" className="mt-2">
              Unsaved
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default PostCard;
