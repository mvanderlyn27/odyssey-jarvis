import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Post } from "../types";
import PostCard from "./PostCard";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect, useState } from "react";

interface DraftPostListProps {
  posts: Post[];
  showNewPostButton?: boolean;
}

const DraftPostList = ({ posts, showNewPostButton }: DraftPostListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(5);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1280) {
        setColumns(5);
      } else if (window.innerWidth >= 1024) {
        setColumns(4);
      } else if (window.innerWidth >= 768) {
        setColumns(3);
      } else if (window.innerWidth >= 640) {
        setColumns(2);
      } else {
        setColumns(1);
      }
    };

    window.addEventListener("resize", updateColumns);
    updateColumns();

    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const count = showNewPostButton ? posts.length + 1 : posts.length;
  const rowCount = Math.ceil(count / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 300,
    overscan: 5,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="w-full">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}>
        {virtualRows.map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => {
              const itemIndex = virtualRow.index * columns + colIndex;
              if (itemIndex >= count) return null;

              if (showNewPostButton && itemIndex === 0) {
                return (
                  <Link to="/posts/draft" key="new-post">
                    <Card className="overflow-hidden h-full">
                      <div className="w-full aspect-[9/16] bg-gray-200 flex items-center justify-center">
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
                );
              }

              const postIndex = showNewPostButton ? itemIndex - 1 : itemIndex;
              if (postIndex < 0 || postIndex >= posts.length) return null;
              const post = posts[postIndex];
              return <PostCard key={post.id} post={post} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftPostList;
