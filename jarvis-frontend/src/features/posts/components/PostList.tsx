import { Post, PostWithAssets } from "../types";
import ConfigurablePostCard from "./ConfigurablePostCard";
import { VirtuosoGrid } from "react-virtuoso";
import { forwardRef, HTMLAttributes, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useEditPostStore } from "@/store/useEditPostStore";
import { ScrollContext } from "../../../contexts/ScrollContext";

interface PostListProps {
  posts: Post[];
  variant: "published" | "draft" | "scheduled";
  startItems?: React.ReactNode[];
}

const List = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <div ref={ref} {...rest} className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
      {children}
    </div>
  );
});

const PostList = ({ posts, variant, startItems = [] }: PostListProps) => {
  const navigate = useNavigate();
  const { post: postInEdit, setPost, isDirty } = useEditPostStore();
  const scrollContainerRef = useContext(ScrollContext);

  const handlePostClick = (post: Post) => {
    if (variant === "draft") {
      setPost(post as PostWithAssets);
      if (post.id !== "draft") {
        navigate(`/posts/${post.id}`);
      } else {
        navigate("/posts/draft");
      }
    } else {
      navigate(`/posts/${post.id}`);
    }
  };

  const items = useMemo(() => {
    return [...startItems, ...posts];
  }, [posts, startItems]);

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

        const isEditing = postInEdit?.id === post.id;
        const coverImageUrl = isEditing ? postInEdit?.post_assets?.[0]?.asset_url : undefined;

        return (
          <ConfigurablePostCard
            key={post.id}
            post={post}
            priority={index < 8}
            index={index}
            variant={variant}
            onClick={handlePostClick}
            isDirty={isEditing && isDirty}
            coverImageUrl={coverImageUrl}
          />
        );
      }}
      components={{
        List,
      }}
    />
  );
};

export default PostList;
