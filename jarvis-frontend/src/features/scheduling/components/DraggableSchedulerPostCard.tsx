import { CSS } from "@dnd-kit/utilities";
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SignedUrlImage } from "@/components/shared/SignedUrlImage";
import { Badge } from "@/components/ui/badge";
import { PostWithAssets } from "@/features/posts/types";
import { Card } from "@/components/ui/card";
import { DraggableSyntheticListeners } from "@dnd-kit/core";

interface DraggableSchedulerPostCardProps {
  post: PostWithAssets;
  listeners?: DraggableSyntheticListeners;
  isDragging?: boolean;
  transform?: any;
  transition?: any;
  isDraggable?: boolean;
}

const DraggableSchedulerPostCard = ({
  post,
  listeners,
  isDragging,
  transform,
  transition,
  isDraggable = true,
}: DraggableSchedulerPostCardProps) => {
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const firstAsset = post.post_assets?.[0];

  return (
    <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.2 } }} className="w-28 h-36" style={style}>
      <div className="relative h-full w-full">
        <Link to={`/posts/${post.id}`} className="absolute inset-0 z-10" />
        <Card className="overflow-hidden h-full w-full bg-background border rounded-lg">
          {firstAsset ? (
            <SignedUrlImage
              thumbnailPath={firstAsset.thumbnail_path}
              fullSizePath={firstAsset.asset_url}
              blurhash={firstAsset.blurhash}
              size="small"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">No asset</div>
          )}
        </Card>
        <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {post.status}
          </Badge>
        </div>
        {isDraggable && (
          <div
            className="absolute top-2 right-2 z-20 cursor-grab p-1 bg-background/50 backdrop-blur-sm rounded-full"
            {...listeners}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DraggableSchedulerPostCard;
