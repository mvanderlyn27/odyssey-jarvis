import { useEffect } from "react";
import { usePost } from "@/features/posts/hooks/usePost";
import { useEditPostStore } from "@/store/useEditPostStore";
import DraftPostEditor from "@/features/posts/components/DraftPostEditor";
import { useParams } from "react-router-dom";

const DraftPostPage = () => {
  const { id: postId } = useParams<{ id: string }>();
  const { data: post, isLoading } = usePost(postId!);
  const { setPost } = useEditPostStore();

  useEffect(() => {
    if (postId && post) {
      setPost(post as any);
    } else if (!postId) {
      setPost({
        title: "",
        description: "",
        post_assets: [],
      } as any);
    }
    return () => setPost(null);
  }, [postId, post, setPost]);

  if (isLoading && postId) return <div>Loading...</div>;

  return <DraftPostEditor />;
};

export default DraftPostPage;
