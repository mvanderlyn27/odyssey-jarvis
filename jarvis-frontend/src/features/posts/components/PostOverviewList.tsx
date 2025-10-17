import { Post } from "../types";
import PostOverviewPostCard from "./PostOverviewPostCard";
import { VirtuosoGrid } from "react-virtuoso";
import { forwardRef, HTMLAttributes } from "react";

interface PostOverviewListProps {
  posts: Post[];
}

const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <div ref={ref} {...rest} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
});

const PostOverviewList = ({ posts }: PostOverviewListProps) => {
  return (
    <VirtuosoGrid
      data={posts}
      useWindowScroll
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
