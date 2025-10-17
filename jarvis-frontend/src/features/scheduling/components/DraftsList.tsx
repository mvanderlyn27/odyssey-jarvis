import DraggablePostCard from "./DraggablePostCard";
import { useDroppable } from "@dnd-kit/core";
import { PostWithAssets } from "./PostCard";

interface DraftsListProps {
  posts: PostWithAssets[];
  isLoading: boolean;
}

const DraftsList = ({ posts, isLoading }: DraftsListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: "drafts-list" });

  if (isLoading) return <div>Loading drafts...</div>;

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h2 className="font-semibold mb-2">Drafts</h2>
      <div
        ref={setNodeRef}
        className={`flex space-x-4 overflow-x-auto pb-4 rounded-md p-2 transition-colors ${
          isOver ? "bg-gray-200 dark:bg-gray-700" : "bg-muted"
        }`}>
        {posts?.map((post) => (
          <DraggablePostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default DraftsList;
