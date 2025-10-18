import { Card, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Post } from "../types";
import { getLatestAnalytics } from "../utils/getLatestAnalytics";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, Eye } from "lucide-react";
import { SignedUrlImage } from "@/components/shared/SignedUrlImage";
import { motion } from "framer-motion";
import { memo } from "react";

interface PostOverviewPostCardProps {
  post: Post;
  priority?: boolean;
  index: number;
}

const PostOverviewPostCard = ({ post, priority }: PostOverviewPostCardProps) => {
  const latestAnalytics = getLatestAnalytics(post.post_analytics);
  console.log("latest antlytics vs all", latestAnalytics, post.post_analytics);
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
        priority={priority}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="rounded-lg overflow-hidden">
      <Link to={`/posts/${post.id}`} key={post.id}>
        <Card className="overflow-hidden flex flex-row w-[450px] bg-neutral-300 dark:bg-neutral-800 text-white border-none rounded-lg">
          <div className="w-40 aspect-[9/16] bg-gray-700 flex-shrink-0">{renderThumbnail()}</div>
          <div className="p-4 flex flex-col flex-grow justify-between min-w-0">
            <div>
              <CardTitle className="truncate text-lg font-bold">{post.title || "Untitled Post"}</CardTitle>
              <div className="flex flex-col text-sm text-gray-400 mt-2">
                {post.tiktok_accounts && (
                  <div className="flex items-center mb-2">
                    <img
                      src={post.tiktok_accounts.tiktok_avatar_url || ""}
                      alt={post.tiktok_accounts.tiktok_display_name || ""}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="truncate font-medium">{post.tiktok_accounts.tiktok_display_name}</span>
                  </div>
                )}
                <Badge variant={getStatusVariant(post.status || "")} className="w-fit">
                  {post.status}
                </Badge>
              </div>
            </div>
            {latestAnalytics && (
              <div className="grid grid-cols-2 gap-2 text-base">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  <span>{(latestAnalytics.views || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  <span>{(latestAnalytics.likes || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span>{(latestAnalytics.comments || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  <span>{(latestAnalytics.shares || 0).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default memo(PostOverviewPostCard);
