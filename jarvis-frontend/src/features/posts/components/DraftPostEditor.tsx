import { useEditPostStore } from "@/store/useEditPostStore";
import PostAssets from "@/features/posts/components/PostAssets";
import PostDetails from "@/features/posts/components/PostDetails";
import PostPublisher from "@/features/posts/components/PostPublisher";
import { Button } from "@/components/ui/button";
import { useSavePost } from "@/features/posts/hooks/useSavePost";
import { useDeletePost } from "@/features/posts/hooks/useDeletePost";
import { useClonePost } from "@/features/posts/hooks/useClonePost";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";

const DraftPostEditor = () => {
  const navigate = useNavigate();
  const { post, isDirty, clearPost } = useEditPostStore();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost(() => {
    clearPost();
    navigate(-1);
  });
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
    } else {
      clearPost();
      navigate(-1);
    }
  };

  if (!post) return <div>Loading post...</div>;

  return (
    <div>
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
      <div className="max-w-7xl mx-auto">
        <PostAssets />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2 space-y-4">
            <PostDetails />
          </div>
          <div className="space-y-4">
            <PostPublisher />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftPostEditor;
