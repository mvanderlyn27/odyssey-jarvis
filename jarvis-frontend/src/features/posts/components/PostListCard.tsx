import { Post, PostWithAssets } from "../types";
import ConfigurablePostCard from "./ConfigurablePostCard";
import { useNavigate } from "react-router-dom";
import { useEditPostStore } from "@/store/useEditPostStore";

interface PostListCardProps {
  post: Post;
  variant: "published" | "draft" | "scheduled";
  index: number;
}

const PostListCard = ({ post, variant, index }: PostListCardProps) => {
  const navigate = useNavigate();
  const { post: postInEdit, setPost, isDirty } = useEditPostStore();

  const handlePostClick = (post: Post) => {
    if (variant === "draft") {
      setPost(post as PostWithAssets);
      if (post.id !== "draft") {
        navigate(`/app/posts/${post.id}`);
      } else {
        navigate("/app/posts/draft");
      }
    } else {
      navigate(`/app/posts/${post.id}`);
    }
  };

  const isEditing = postInEdit?.id === post.id;
  const coverImageUrl = isEditing ? postInEdit?.post_assets?.[0]?.asset_url || undefined : undefined;

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
};

export default PostListCard;
