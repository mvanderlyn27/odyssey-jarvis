import { Card, CardTitle } from "@/components/ui/card";
import { Post } from "../types";
import { getLatestAnalytics } from "../utils/getLatestAnalytics";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, Eye, Calendar, Edit, Video } from "lucide-react";
import { SignedUrlImage } from "@/components/shared/SignedUrlImage";
import { motion } from "framer-motion";
import { memo } from "react";
import { format } from "date-fns";

interface ConfigurablePostCardProps {
  post: Post;
  priority?: boolean;
  onClick: (post: Post) => void;
  variant: "published" | "draft" | "scheduled";
  index: number;
  isDirty?: boolean;
  coverImageUrl?: string;
}

const ConfigurablePostCard = ({
  post,
  priority,
  onClick,
  variant,
  isDirty,
  coverImageUrl,
}: ConfigurablePostCardProps) => {
  const latestAnalytics = getLatestAnalytics(post.post_analytics);
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
    if (coverImageUrl) {
      return <img src={coverImageUrl} alt="cover" className="w-full h-full object-cover" />;
    }

    if (!firstAsset) {
      return <div className="flex items-center justify-center h-full bg-gray-800 text-gray-500">No assets</div>;
    }

    return (
      <>
        {firstAsset.asset_type === "video" && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded-full p-1">
            <Video className="w-4 h-4 text-white" />
          </div>
        )}
        <SignedUrlImage
          thumbnailPath={firstAsset.thumbnail_path}
          fullSizePath={firstAsset.asset_url}
          blurhash={firstAsset.blurhash}
          size="large"
          priority={priority}
        />
      </>
    );
  };

  const PublishedContent = () => (
    <>
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
    </>
  );

  const DraftContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div>
        <CardTitle className="truncate text-lg font-bold">{post.title || "Untitled Draft"}</CardTitle>
        <p className="text-sm text-gray-400 mt-2">{post.description || "No description"}</p>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
        <div className="flex items-center">
          <Edit className="w-4 h-4 mr-2" />
          <span>Last updated: {format(new Date(post.created_at), "PPp")}</span>
        </div>
        {isDirty && <Badge variant="destructive">Unsaved</Badge>}
      </div>
    </div>
  );

  const ScheduledContent = () => (
    <div className="flex flex-col justify-center h-full">
      <CardTitle className="truncate text-lg font-bold">{post.title || "Untitled Post"}</CardTitle>
      <div className="flex items-center text-sm text-gray-400 mt-2">
        <Calendar className="w-4 h-4 mr-2" />
        <span>Scheduled for: {post.scheduled_at ? format(new Date(post.scheduled_at), "PPp") : "Not set"}</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case "published":
        return <PublishedContent />;
      case "draft":
        return <DraftContent />;
      case "scheduled":
        return <ScheduledContent />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="rounded-lg overflow-hidden cursor-pointer w-full"
      onClick={() => onClick(post)}>
      <Card className="overflow-hidden flex flex-col sm:flex-row w-full bg-neutral-300 dark:bg-neutral-800 text-white border-none rounded-lg">
        <div className="w-full sm:w-40 aspect-video sm:aspect-[9/16] bg-gray-700 flex-shrink-0">
          {renderThumbnail()}
        </div>
        <div className="p-4 flex flex-col flex-grow justify-between min-w-0">{renderContent()}</div>
      </Card>
    </motion.div>
  );
};

export default memo(ConfigurablePostCard);
