import { usePosts } from "@/features/posts/hooks/usePosts";
import { PostWithAssets } from "@/features/posts/types";
import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";

const DraftsList = () => {
  const { data: drafts, isLoading } = usePosts({ status: "DRAFT" });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Drafts</h2>
      <div>
        {(drafts || []).map((post: PostWithAssets) => (
          <DraggableSchedulerPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default DraftsList;
