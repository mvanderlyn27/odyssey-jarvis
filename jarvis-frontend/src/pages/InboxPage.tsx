import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInboxPosts } from "@/features/posts/hooks/useInboxPosts";
import { Link } from "react-router-dom";
import { useSignedUrls } from "@/hooks/useSignedUrls";
import { useMemo } from "react";

const InboxPage = () => {
  const { data: posts, isLoading, isError } = useInboxPosts();
  const assets = useMemo(() => posts?.map((post: any) => post.post_assets?.[0]).filter(Boolean), [posts]);
  const { signedUrls } = useSignedUrls(assets);

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
    <Card>
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading inbox...</p>}
        {isError && <p>Error loading inbox.</p>}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts?.map((post: any) => (
              <Link to={`/posts/${post.id}`} key={post.id}>
                <Card className="overflow-hidden">
                  <div className="w-full aspect-[9/16] bg-gray-200">{renderThumbnail(post)}</div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{post.title || "Untitled Post"}</span>
                      <div className="flex items-center">
                        <span className="ml-2 text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
                          {post.status}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            )) || <p>No posts found in inbox.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InboxPage;
