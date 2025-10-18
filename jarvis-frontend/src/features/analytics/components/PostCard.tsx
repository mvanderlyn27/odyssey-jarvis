import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { SignedUrlImage } from "@/components/shared/SignedUrlImage";

export const PostCard = ({ post }: { post: any }) => {
  const firstAsset = post.post_assets?.[0];
  const cur_analytics =
    post.post_analytics
      ?.slice()
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || {};

  return (
    <Link to={`/posts/${post.id}`}>
      <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
        <CardHeader>
          <SignedUrlImage
            thumbnailPath={firstAsset?.thumbnail_path}
            fullSizePath={firstAsset?.asset_url}
            blurhash={firstAsset?.blurhash}
            size="large"
            className="rounded-lg"
          />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-lg font-bold truncate">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground truncate">{post.description}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
            <p>Views:</p>
            <p className="text-right">{(cur_analytics.views || 0).toLocaleString()}</p>
            <p>Likes:</p>
            <p className="text-right">{(cur_analytics.likes || 0).toLocaleString()}</p>
            <p>Comments:</p>
            <p className="text-right">{(cur_analytics.comments || 0).toLocaleString()}</p>
            <p>Shares:</p>
            <p className="text-right">{(cur_analytics.shares || 0).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
