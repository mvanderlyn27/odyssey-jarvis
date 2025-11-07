import { useEditPostStore } from "@/store/useEditPostStore";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePost } from "@/features/posts/hooks/usePost";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/RefreshButton";
import { useSavePost } from "@/features/posts/hooks/useSavePost";
import { useDeletePost } from "@/features/posts/hooks/useDeletePost";
import { useClonePost } from "@/features/posts/hooks/useClonePost";
import PostDetailAssetList from "@/features/posts/components/PostDetailAssetList";
import PostDetails from "@/features/posts/components/PostDetails";
import PostPublisher from "@/features/posts/components/PostPublisher";

import { Post, DraftPost } from "@/features/posts/types";

const EditPost = ({ postId }: { postId: string }) => {
  const navigate = useNavigate();
  const { clearPostInEdit, confirmDiscardChanges } = useEditPostStore();
  const [post, setPost] = useState<Post | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const { data: fetchedPost, isLoading, refetch, isFetching } = usePost(postId);
  const { data: posts } = usePosts();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: clonePost, isPending: isCloning } = useClonePost();

  useEffect(() => {
    refetch();
  }, [postId, refetch]);

  useEffect(() => {
    console.log("DraftPostPage: EditPost mounted");
    if (fetchedPost) {
      console.log("DraftPostPage: Fetched post", fetchedPost);
      setPost(fetchedPost);
    }

    return () => {
      console.log("DraftPostPage: EditPost unmounted");
      if (isDirty && !window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        return;
      }
      clearPostInEdit();
    };
  }, [fetchedPost, isDirty, clearPostInEdit]);

  useEffect(() => {
    if (post) {
      const videoAssetWithoutThumbnail = post.post_assets.find(
        (asset) => asset.asset_type === "videos" && !asset.thumbnail_path
      );

      if (videoAssetWithoutThumbnail) {
        const interval = setInterval(() => {
          refetch();
        }, 2000);

        const timeout = setTimeout(() => {
          clearInterval(interval);
        }, 10000); // Stop polling after 10 seconds

        return () => {
          clearInterval(interval);
          clearTimeout(timeout);
        };
      }
    }
  }, [post, refetch]);

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Do you want to save them before leaving?")) {
        if (post) {
          savePost(post as DraftPost, {
            onSuccess: () => {
              clearPostInEdit();
              navigate(-1);
            },
          });
        }
      } else {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleClonePost = () => {
    if (post?.id) {
      clonePost(post.id, {
        onSuccess: (data) => {
          navigate(`/app/posts/${data.post.id}`);
        },
      });
    }
  };

  const handleDelete = () => {
    if (post?.id) {
      deletePost(post.id, {
        onSuccess: () => {
          navigate(-1);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 text-center">
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 sm:p-6 md:p-8 text-center">
        <p>Post not found.</p>
        <Button onClick={() => navigate("/app/drafts")} className="mt-4">
          Go to Drafts
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader onBackClick={handleBack} status={post.status || undefined}>
        <RefreshButton onClick={() => refetch()} isRefreshing={isFetching} />
        {isDirty && <span className="text-sm text-yellow-500">Unsaved changes</span>}
        <Button onClick={() => savePost(post as DraftPost)} disabled={isSaving || !isDirty}>
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
      <div className="max-w-[80vw] mx-auto">
        <PostDetailAssetList post={post} setPost={setPost} setIsDirty={setIsDirty} />
        <div className="grid grid-cols-1 lg:grid-cols-2 mt-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <PostDetails post={post} setPost={setPost} setIsDirty={setIsDirty} />
          </div>
          <div className="lg-col-span-1 space-y-4">
            <PostPublisher posts={posts || []} post={post} isDirty={isDirty} />
          </div>
        </div>
      </div>
    </div>
  );
};

const NewPost = () => {
  const navigate = useNavigate();
  const { post: postFromStore, isDirty: isDirtyFromStore, deleteUnsavedDraft } = useEditPostStore();
  const [post, setPost] = useState<Post | null>(postFromStore);
  const [isDirty, setIsDirty] = useState(isDirtyFromStore);
  const { data: posts } = usePosts();
  const { mutate: savePost, isPending: isSaving } = useSavePost();

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Do you want to save them before leaving?")) {
        if (post) {
          savePost(post as DraftPost, {
            onSuccess: () => navigate(-1),
          });
        }
      } else {
        deleteUnsavedDraft();
        navigate(-1);
      }
    } else {
      deleteUnsavedDraft();
      navigate(-1);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this unsaved draft?")) {
      deleteUnsavedDraft();
      navigate(-1);
    }
  };

  if (!post) {
    return (
      <div className="p-4 sm:p-6 md:p-8 text-center">
        <p>No post is currently being edited.</p>
        <Button onClick={() => navigate("/app/drafts")} className="mt-4">
          Go to Drafts
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader title={post.title || "New Draft"} onBackClick={handleBack}>
        {isDirty && <span className="text-sm text-yellow-500">Unsaved changes</span>}
        <Button onClick={() => savePost(post as DraftPost)} disabled={isSaving || !isDirty}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button onClick={handleDelete} variant="destructive">
          Delete
        </Button>
      </PageHeader>
      <div className="max-w-[80vw] mx-auto">
        <PostDetailAssetList post={post} setPost={setPost} setIsDirty={setIsDirty} />
        <div className="grid grid-cols-1 lg:grid-cols-2 mt-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <PostDetails post={post} setPost={setPost} setIsDirty={setIsDirty} />
          </div>
          <div className="lg-col-span-1 space-y-4">
            <PostPublisher posts={posts || []} post={post} isDirty={isDirty} />
          </div>
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
