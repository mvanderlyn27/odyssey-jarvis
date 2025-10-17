import { useEditPostStore } from "@/store/useEditPostStore";
import PostAssets from "@/features/posts/components/PostAssets";
import PostDetails from "@/features/posts/components/PostDetails";
import PostPublisher from "@/features/posts/components/PostPublisher";
import { Button } from "@/components/ui/button";
import { useSavePost } from "@/features/posts/hooks/useSavePost";
import { useDeletePost } from "@/features/posts/hooks/useDeletePost";
import { useClonePost } from "@/features/posts/hooks/useClonePost";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";

const DraftPostEditor = () => {
  const navigate = useNavigate();
  const { post, isDirty } = useEditPostStore();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost(() => navigate("/posts"));
  const { mutate: clonePost, isPending: isCloning } = useClonePost();

  const handleClonePost = () => {
    if (post?.id) {
      clonePost(post.id, {
        onSuccess: (data) => {
          navigate(`/posts/${data.post.id}`);
        },
      });
    }
  };

  const handleDelete = () => {
    if (post?.id) {
      deletePost(post.id);
    }
  };

  if (!post) return <div>Loading post...</div>;

  return (
    <div className="container mx-auto p-4">
      <PageHeader title={post.id ? "Edit Post" : "New Post"}>
        {isDirty && <span className="text-sm text-yellow-500">Unsaved changes</span>}
        <Button onClick={() => savePost(post)} disabled={isSaving || !isDirty}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        {post.id && (
          <>
            <Button onClick={handleClonePost} variant="outline" disabled={isCloning}>
              {isCloning ? "Cloning..." : "Clone"}
            </Button>
            <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        )}
      </PageHeader>
      <PostAssets />
      <div className="lg:col-span-2 space-y-4">
        <PostDetails />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <PostPublisher />
      </div>
    </div>
  );
};

export default DraftPostEditor;
