import { PostWithAssets } from "@/features/posts/types";
import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

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
        transform={transform}
        transition={transition}
        listeners={listeners}
      />
    </div>
  );
};

interface SchedulerPostListProps {
  posts: PostWithAssets[];
  isLoading: boolean;
  onSort: (posts: PostWithAssets[]) => void;
}

const SchedulerPostList = ({ posts, isLoading, onSort }: SchedulerPostListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: "drafts-list" });

  if (isLoading) return <div>Loading drafts...</div>;

  return (
    <div className="p-4 border rounded-lg  bg-card">
      <h2 className="font-semibold mb-2">Drafts</h2>
      <div
        ref={setNodeRef}
        className={`overflow-x-auto pb-4 rounded-md p-2 transition-colors ${
          isOver ? "bg-slate-200 dark:bg-gray-700" : "bg-slate-100 dark:bg-gray-900"
        }`}
        style={{
          height: "180px",
          minHeight: "180px",
          overflowY: "hidden",
        }}>
        <div className="flex gap-4 h-full">
          <SortableContext items={posts.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
            {posts.map((post) => (
              <SortablePostCard key={post.id} post={post} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPostList;
