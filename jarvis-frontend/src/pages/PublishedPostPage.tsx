import PublishedPostDetails from "../features/posts/components/PublishedPostDetails";

const PublishedPostPage = ({ postId }: { postId: string }) => {
  return <PublishedPostDetails postId={postId} />;
};

export default PublishedPostPage;
