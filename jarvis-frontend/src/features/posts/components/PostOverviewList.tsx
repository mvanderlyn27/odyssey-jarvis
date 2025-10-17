import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Post } from "../types";
import PostOverviewPostCard from "./PostOverviewPostCard";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface PostOverviewListProps {
  posts: Post[];
  showNewPostButton?: boolean;
}

const PostOverviewList = ({ posts, showNewPostButton }: PostOverviewListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const count = showNewPostButton ? posts.length + 1 : posts.length;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
      {showNewPostButton && (
        <Link to="/posts/draft">
          <Card className="overflow-hidden h-full">
            <div className="w-full aspect-square bg-gray-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24"
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
      {items.map((virtualItem) => {
        const postIndex = showNewPostButton ? virtualItem.index - 1 : virtualItem.index;
        if (postIndex < 0) return null;
        const post = posts[postIndex];
        return <PostOverviewPostCard key={post.id} post={post} />;
      })}
    </div>
  );
};

export default PostOverviewList;
