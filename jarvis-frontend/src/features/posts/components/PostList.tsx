import { Post } from "../types";
import { VirtuosoGrid } from "react-virtuoso";
import { forwardRef, HTMLAttributes, useContext } from "react";
import { ScrollContext } from "../../../contexts/ScrollContext";
import PostListCard from "./PostListCard";
import PostCardSkeleton from "./PostCardSkeleton";

interface PostListProps {
  posts: Post[];
  variant: "published" | "draft" | "scheduled";
  startItems?: React.ReactNode[];
  isLoading?: boolean;
  isFetching?: boolean;
}

const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <div ref={ref} {...rest} className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
      {children}
    </div>
  );
});

const PostList = ({ posts, variant, startItems = [], isLoading = false, isFetching = false }: PostListProps) => {
  const scrollContainerRef = useContext(ScrollContext);

  const items = [...startItems, ...posts];

  if (isLoading && !isFetching) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <VirtuosoGrid
      data={items}
      customScrollParent={scrollContainerRef?.current || undefined}
      overscan={200}
      itemContent={(index, item) => {
        if (index < startItems.length) {
          return <>{item}</>;
        }

        const post = item as Post;
        if (!post) return null;

        return <PostListCard post={post} variant={variant} index={index} />;
      }}
      components={{
        List,
      }}
    />
  );
};

export default PostList;
