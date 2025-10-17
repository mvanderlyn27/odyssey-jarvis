import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";
import { useDroppable } from "@dnd-kit/core";
import { PostWithAssets } from "./PostCard";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface SchedulerPostListProps {
  posts: PostWithAssets[];
  isLoading: boolean;
}

const SchedulerPostList = ({ posts, isLoading }: SchedulerPostListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: "drafts-list" });
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
    horizontal: true,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (isLoading) return <div>Loading drafts...</div>;

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h2 className="font-semibold mb-2">Drafts</h2>
      <div
        ref={parentRef}
        className={`flex overflow-x-auto pb-4 rounded-md p-2 transition-colors ${
          isOver ? "bg-gray-200 dark:bg-gray-700" : "bg-muted"
        }`}
        style={{
          height: "250px",
        }}>
        <div
          ref={setNodeRef}
          style={{
            width: `${virtualizer.getTotalSize()}px`,
            height: "100%",
            position: "relative",
          }}>
          {virtualItems.map((virtualItem) => {
            const post = posts[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${virtualItem.size}px`,
                  transform: `translateX(${virtualItem.start}px)`,
                }}>
                <DraggableSchedulerPostCard post={post} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SchedulerPostList;
