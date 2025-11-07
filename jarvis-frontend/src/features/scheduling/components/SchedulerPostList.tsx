import { PostWithAssets } from "@/features/posts/types";
import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import { SortableContext, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import SchedulerPostCardSkeleton from "./SchedulerPostCardSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { FilePlus2 } from "lucide-react";

const SortablePostCard = ({ post }: { post: PostWithAssets }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: post.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    visibility: isDragging ? "hidden" : "visible",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <DraggableSchedulerPostCard
        post={post}
        isDragging={isDragging}
        listeners={listeners}
        transform={transform}
        transition={transition}
      />
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
          <EmptyState
            Icon={FilePlus2}
            title="No Drafts"
            description="You have no drafts to schedule. Create a new post to get started."
            actionText={actionText}
            onAction={onAction}
          />
        </div>
      );
    }

    return (
      <SortableContext items={posts.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-4 h-full">
          {posts.map((post) => (
            <SortablePostCard key={post.id} post={post} />
          ))}
        </div>
      </SortableContext>
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
