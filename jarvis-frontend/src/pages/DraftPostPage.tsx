import { useEditPostStore } from "@/store/useEditPostStore";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { usePost } from "@/features/posts/hooks/usePost";
import { PostWithAssets } from "@/features/posts/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSavePost } from "@/features/posts/hooks/useSavePost";
import { useDeletePost } from "@/features/posts/hooks/useDeletePost";
import { useClonePost } from "@/features/posts/hooks/useClonePost";
import PostAssets from "@/features/posts/components/PostAssets";
import PostDetails from "@/features/posts/components/PostDetails";
import PostPublisher from "@/features/posts/components/PostPublisher";

const EditPost = ({ postId }: { postId: string }) => {
  const navigate = useNavigate();
  const { post, setPost, isDirty, clearPost } = useEditPostStore();
  const { data: fetchedPost, isLoading } = usePost(postId);
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost(() => {
    clearPost();
    navigate(-1);
  });
  const { mutate: clonePost, isPending: isCloning } = useClonePost();

  useEffect(() => {
    if (fetchedPost && fetchedPost.id !== post?.id) {
      setPost(fetchedPost as PostWithAssets);
    }
  }, [fetchedPost, post?.id, setPost]);

  const handleBack = () => {
    navigate("/drafts");
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Post not found.</p>
        <Button onClick={() => navigate("/drafts")} className="mt-4">
          Go to Drafts
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader title={post.title || "Edit Draft"} onBackClick={handleBack}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 mt-4 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <PostDetails />
        </div>
        <div className="lg-col-span-1 space-y-4">
          <PostPublisher />
        </div>
      </div>
    </div>
  );
};

const NewPost = () => {
  const navigate = useNavigate();
  const { post, isDirty, deleteUnsavedDraft } = useEditPostStore();
  const { mutate: savePost, isPending: isSaving } = useSavePost();

  const handleBack = () => {
    navigate("/drafts");
  };

  const handleDelete = () => {
    if (deleteUnsavedDraft()) {
      navigate(-1);
    }
  };

  if (!post) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>No post is currently being edited.</p>
        <Button onClick={() => navigate("/drafts")} className="mt-4">
          Go to Drafts
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader title={post.title || "New Draft"} onBackClick={handleBack}>
        {isDirty && <span className="text-sm text-yellow-500">Unsaved changes</span>}
        <Button onClick={() => savePost(post)} disabled={isSaving || !isDirty}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button onClick={handleDelete} variant="destructive">
          Delete
        </Button>
      </PageHeader>
      <PostAssets />
      <div className="grid grid-cols-1 lg:grid-cols-2 mt-4 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <PostDetails />
        </div>
        <div className="lg-col-span-1 space-y-4">
          <PostPublisher />
        </div>
      </div>
    </div>
  );
};

const DraftPostPage = () => {
  const { id: postId } = useParams<{ id: string }>();
  const { isDirty, saving } = useEditPostStore();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty && !saving) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, saving]);

  if (postId) {
    return <EditPost postId={postId} />;
  }

  return <NewPost />;
};

export default DraftPostPage;
