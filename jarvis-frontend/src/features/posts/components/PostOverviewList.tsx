import { Post } from "../types";
import PostOverviewPostCard from "./PostOverviewPostCard";
import { VirtuosoGrid } from "react-virtuoso";
import { forwardRef, HTMLAttributes, useContext } from "react";
import { ScrollContext } from "../../../contexts/ScrollContext";
import { LucideStopCircle } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

interface PostOverviewListProps {
  posts: Post[];
}

const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <div ref={ref} {...rest} className="grid grid-cols-[repeat(auto-fit,minmax(350px,min-content))] gap-4">
      {children}
    </div>
  );
});

const PostOverviewList = ({ posts }: PostOverviewListProps) => {
  const scrollContainerRef = useContext(ScrollContext);

  if (posts.length === 0) {
    return (
      <EmptyState
        Icon={LucideStopCircle}
        title="No posts to display"
        description="There are currently no posts to show in this view."
      />
    );
  }

  return (
    <VirtuosoGrid
      data={posts}
      customScrollParent={scrollContainerRef?.current || undefined}
      overscan={200}
      itemContent={(index, post) => (
        <PostOverviewPostCard key={post.id} post={post} priority={index < 8} index={index} />
      )}
      components={{
        List,
      }}
    />
  );
};

export default PostOverviewList;
