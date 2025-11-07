import { useParams } from "react-router-dom";
import { usePost } from "../features/posts/hooks/usePost";
import DraftPostPage from "./DraftPostPage";
import PublishedPostDetails from "../features/posts/components/PublishedPostDetails";

const PostDetailPage = () => {
  const { id } = useParams();
  const { data: post, isLoading } = usePost(id!);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!id || !post) {
    return <div>Post not found</div>;
  }

  const isDraftOrScheduled = post.status === "DRAFT" || post.status === "SCHEDULED";

  if (isDraftOrScheduled) {
    return <DraftPostPage />;
  }

  return <PublishedPostDetails postId={id} />;
};

export default PostDetailPage;
