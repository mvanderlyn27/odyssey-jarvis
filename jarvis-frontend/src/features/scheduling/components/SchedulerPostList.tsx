import { PostWithAssets } from "@/features/posts/types";
import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import { SortableContext, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";

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
}

const SchedulerPostList = ({ posts, isLoading }: SchedulerPostListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: "drafts-list" });

  if (isLoading) return <div>Loading drafts...</div>;

  return (
    <div className=" border rounded-lg bg-card">
      <div
        ref={setNodeRef}
        className={`overflow-x-auto p-4 rounded-md  transition-colors ${
          isOver ? "bg-slate-200 dark:bg-gray-700" : "bg-slate-100 dark:bg-gray-900"
        }`}
        style={{
          height: "180px",
          minHeight: "180px",
          overflowY: "hidden",
        }}>
        <SortableContext items={posts.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-4 h-full">
            {posts.map((post) => (
              <SortablePostCard key={post.id} post={post} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default SchedulerPostList;
