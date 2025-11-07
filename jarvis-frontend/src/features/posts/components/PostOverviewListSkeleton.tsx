import PostCardSkeleton from "./PostCardSkeleton";

const PostOverviewListSkeleton = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,min-content))] gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default PostOverviewListSkeleton;
