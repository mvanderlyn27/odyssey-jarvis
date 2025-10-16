import { useEffect } from "react";
import PostDetails from "../features/posts/components/PostDetails";
import PostAssets from "../features/posts/components/PostAssets";
import PostPublisher from "../features/posts/components/PostPublisher";
import { useEditPostStore } from "@/store/useEditPostStore";
import { PostWithAssets } from "@/store/useEditPostStore";

const DraftPostPage = ({ post }: { post: PostWithAssets }) => {
  const { setPost } = useEditPostStore();

  useEffect(() => {
    setPost(post);
    return () => setPost(null);
  }, [post, setPost]);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <PostDetails />
          <PostAssets />
        </div>
        <div>
          <PostPublisher />
        </div>
      </div>
    </div>
  );
};

export default DraftPostPage;
