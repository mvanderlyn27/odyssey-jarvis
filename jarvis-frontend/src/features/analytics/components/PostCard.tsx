import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useSignedUrls } from "@/hooks/useSignedUrls";

export const PostCard = ({ post }: { post: any }) => {
  const { signedUrls } = useSignedUrls(post.post_assets);
  const coverImageUrl = signedUrls[post.post_assets?.[0]?.asset_url] || "";
  const analytics = post.post_analytics?.[0] || {};

  return (
    <Link to={`/posts/${post.id}`}>
      <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
        <CardHeader>
          {coverImageUrl ? (
            <img src={coverImageUrl} alt={post.title} className="rounded-lg" />
          ) : (
            <div className="h-48 w-full bg-gray-200 rounded-lg" />
          )}
        </CardHeader>
        <CardContent>
          <CardTitle className="text-lg font-bold truncate">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground truncate">{post.description}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
            <p>Views:</p>
            <p className="text-right">{(analytics.views || 0).toLocaleString()}</p>
            <p>Likes:</p>
            <p className="text-right">{(analytics.likes || 0).toLocaleString()}</p>
            <p>Comments:</p>
            <p className="text-right">{(analytics.comments || 0).toLocaleString()}</p>
            <p>Shares:</p>
            <p className="text-right">{(analytics.shares || 0).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
