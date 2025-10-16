import { Tables } from "@/lib/supabase/database";
import React from "react";
import { Link } from "react-router-dom";
import { useSignedUrls } from "@/hooks/useSignedUrls";

export type PostWithAssets = Tables<"posts"> & {
  post_assets: Tables<"post_assets">[];
};

const PostCardComponent = React.forwardRef<
  HTMLDivElement,
  {
    post: PostWithAssets;
    style?: React.CSSProperties;
    listeners?: any;
    attributes?: any;
    isOverlay?: boolean;
  }
>(({ post, style, listeners, attributes, isOverlay = false }, ref) => {
  const { signedUrls } = useSignedUrls(post.post_assets);
  const firstAsset = post.post_assets?.[0];
  const thumbnailUrl = signedUrls[firstAsset?.asset_url] || "";

  return (
    <div ref={ref} style={style} className="relative w-48 h-24 bg-muted rounded-md border flex items-center space-x-2">
      <Link to={`/posts/${post.id}`} className="flex-grow h-full p-2 flex items-center space-x-2">
        <div className="w-12 h-full bg-gray-200 rounded-md flex-shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={post.title || "Post thumbnail"}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xs text-gray-500 text-center">No Image</p>
            </div>
          )}
        </div>
        <div className="flex-grow overflow-hidden">
          <h3 className="font-semibold text-sm truncate text-center">{post.title || "Untitled"}</h3>
          <p className="text-xs text-muted-foreground truncate text-center">{post.status}</p>
        </div>
      </Link>
      {!isOverlay && (
        <div className="h-full flex items-center px-2 cursor-grab" {...listeners} {...attributes}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </div>
      )}
    </div>
  );
});

const PostCard = React.memo(PostCardComponent);

export default PostCard;
