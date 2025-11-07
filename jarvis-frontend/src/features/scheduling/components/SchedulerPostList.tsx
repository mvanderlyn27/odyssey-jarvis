import { PostWithAssets } from "@/features/posts/types";
import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import SchedulerPostCardSkeleton from "./SchedulerPostCardSkeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DraggablePostCard = ({ post }: { post: PostWithAssets }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    visibility: isDragging ? "hidden" : "visible",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Link to={`/app/posts/${post.id}`}>
        <DraggableSchedulerPostCard post={post} isDragging={isDragging} listeners={listeners} />
      </Link>
    </div>
  );
};

interface SchedulerPostListProps {
  posts: PostWithAssets[];
  isLoading: boolean;
  onAction?: () => void;
  actionText?: string;
}

const SchedulerPostList = ({ posts, isLoading, onAction, actionText }: SchedulerPostListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: "drafts-list" });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex gap-4 h-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <SchedulerPostCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <p className="text-muted-foreground">You have no drafts to schedule.</p>
            {actionText && onAction && (
              <Button onClick={onAction} variant="outline" className="mt-2">
                {actionText}
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-4 h-full">
        {posts.map((post) => (
          <DraggablePostCard key={post.id} post={post} />
        ))}
      </div>
    );
  };

  return (
    <div className="border rounded-lg bg-card">
      <div
        ref={setNodeRef}
        className={`overflow-x-auto p-4 rounded-md transition-colors ${
          isOver ? "bg-slate-200 dark:bg-gray-700" : "bg-slate-100 dark:bg-gray-900"
        }`}
        style={{
          height: "180px",
          minHeight: "180px",
          overflowY: "hidden",
        }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default SchedulerPostList;
