import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { useMemo } from "react";
import { useEditPostStore } from "@/store/useEditPostStore";

interface PostsListProps {
  posts: any[];
  showNewPostButton?: boolean;
}

const PostsList = ({ posts, showNewPostButton }: PostsListProps) => {
  const assets = useMemo(() => posts?.map((post: any) => post.post_assets?.[0]).filter(Boolean), [posts]);
  const { signedUrls } = useSignedUrls(assets);
  const { post: activePost, isDirty } = useEditPostStore() as any;

  const renderThumbnail = (post: any) => {
    if (!post.post_assets || post.post_assets.length === 0) {
      return <div className="flex items-center justify-center h-full">No assets</div>;
    }

    const firstAsset = post.post_assets[0];
    const url = signedUrls[firstAsset.asset_url];

    if (!url) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (firstAsset.asset_type === "slides") {
      return <img src={url} alt={`Post asset ${firstAsset.id}`} className="w-full h-full object-cover" />;
    } else {
      return <video src={url} className="w-full h-full object-cover" poster={url} />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {showNewPostButton && (
        <Link to="/posts/new">
          <Card className="overflow-hidden h-full">
            <div className="w-full aspect-[9/16] bg-gray-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">New Post</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}
      {posts?.map((post: any) => (
        <Link to={`/posts/${post.id}`} key={post.id}>
          <Card className="overflow-hidden">
            <div className="w-full aspect-[9/16] bg-gray-200">{renderThumbnail(post)}</div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{post.title || "Untitled Post"}</span>
                <div className="flex items-center">
                  {post.status === "PUBLISHED" ? (
                    <span className="ml-2 text-xs text-green-500 bg-green-100 px-2 py-1 rounded-full">Published</span>
                  ) : post.status === "FAILED" ? (
                    <span className="ml-2 text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">Failed</span>
                  ) : (
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{post.status}</span>
                  )}
                  {activePost?.id === post.id && isDirty && (
                    <span className="ml-2 text-xs text-yellow-500 bg-yellow-100 px-2 py-1 rounded-full">Unsaved</span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )) || <p>No posts found.</p>}
    </div>
  );
};

export default PostsList;
