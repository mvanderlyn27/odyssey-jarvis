import { PostWithAssets } from "@/features/posts/types";
import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

const DraggablePostCard = ({ post }: { post: PostWithAssets }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    visibility: isDragging ? "hidden" : "visible",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <DraggableSchedulerPostCard post={post} isDragging={isDragging} listeners={listeners} />
    </div>
  );
};

interface SchedulerPostListProps {
  posts: PostWithAssets[];
  isLoading: boolean;
  onSort: (posts: PostWithAssets[]) => void;
}

const SchedulerPostList = ({ posts, isLoading }: SchedulerPostListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: "drafts-list" });

  if (isLoading) return <div>Loading drafts...</div>;

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h2 className="font-semibold mb-2">Drafts</h2>
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
        <div className="flex gap-4 h-full">
          {posts.map((post) => (
            <DraggablePostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchedulerPostList;
