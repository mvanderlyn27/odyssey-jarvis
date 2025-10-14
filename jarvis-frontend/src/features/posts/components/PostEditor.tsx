import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { useEditPostStore } from "@/store/useEditPostStore";
import PostAssets from "@/features/posts/components/PostAssets";
import PostDetails from "@/features/posts/components/PostDetails";
import PostPublisher from "@/features/posts/components/PostPublisher";
import { Button } from "@/components/ui/button";
import { useSavePost } from "@/features/posts/hooks/useSavePost";
import { useDeletePost } from "@/features/posts/hooks/useDeletePost";
import { useClonePost } from "@/features/posts/hooks/useClonePost";
import ImageModifier from "@/features/posts/components/ImageModifier";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

const PostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: postData, isLoading } = useQuery(queries.posts.detail(id!));
  const { setPost, post, isEditorOpen, openEditor, isDirty } = useEditPostStore();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost(() => navigate("/posts"));
  const { mutate: clonePost, isPending: isCloning } = useClonePost();

  useEffect(() => {
    if (postData) {
      setPost(postData as any);
    }
    return () => setPost(null);
  }, [postData, setPost]);

  if (isLoading) return <div>Loading...</div>;
  if (!post) return <div>Post not found.</div>;

  const handleClonePost = () => {
    if (post) {
      clonePost(post.id, {
        onSuccess: (data) => {
          navigate(`/posts/${data.post.id}`);
        },
      });
    }
  };

  const handleDelete = () => {
    if (post) {
      deletePost(post.id);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/posts")} variant="outline" size="icon">
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <span className="text-sm text-gray-500 uppercase">{post.status}</span>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && <span className="text-sm text-yellow-500">Unsaved changes</span>}
          <Button onClick={() => savePost(post)} disabled={isSaving || !isDirty}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={handleClonePost} variant="outline" disabled={isCloning}>
            {isCloning ? "Cloning..." : "Clone Post"}
          </Button>
          <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <PostAssets onEditAsset={(asset) => openEditor([asset], "edit")} />
        </div>
        <div>
          <PostDetails />
          <PostPublisher />
        </div>
      </div>
      {isEditorOpen && <ImageModifier />}
    </div>
  );
};

export default PostEditor;
