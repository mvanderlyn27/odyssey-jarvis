import { useDraggable } from "@dnd-kit/core";
import PostCard, { PostWithAssets } from "./PostCard";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

const DraggablePostCard = ({ post }: { post: PostWithAssets }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    data: { post },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    touchAction: "none",
    opacity: isDragging ? 0 : 1,
  };

  return <PostCard ref={setNodeRef} post={post} style={style} listeners={listeners} attributes={attributes} />;
};

export default DraggablePostCard;
