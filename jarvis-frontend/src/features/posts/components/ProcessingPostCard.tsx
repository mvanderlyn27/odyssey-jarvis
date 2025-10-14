import { Button } from "@/components/ui/button";
import { useRefreshPostStatus } from "../hooks/useRefreshPostStatus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useDeletePost } from "../hooks/useDeletePost";

interface ProcessingPostCardProps {
  post: any;
}

export const ProcessingPostCard = ({ post }: ProcessingPostCardProps) => {
  const { mutate: refreshStatus, isPending } = useRefreshPostStatus();
  const { mutate: deletePost } = useDeletePost();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    deletePost(post.id);
  };

  return (
    <div className="border p-4 rounded-lg flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center mb-2">
          {post.tiktok_accounts ? (
            <>
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={post.tiktok_accounts.tiktok_avatar_url} alt={post.tiktok_accounts.display_name} />
                <AvatarFallback>{post.tiktok_accounts.tiktok_display_name}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{post.tiktok_accounts.tiktok_display_name}</span>
            </>
          ) : (
            <div className="h-8 w-8 mr-2 flex items-center justify-center bg-gray-200 rounded-full">?</div>
          )}
        </div>
        <Link to={`/posts/${post.id}`}>
          <h2 className="font-bold hover:underline">{post.title}</h2>
        </Link>
        <p className="text-sm text-gray-600 mb-2">{post.description}</p>
        {post.status === "FAILED" && post.reason && <p className="text-sm text-red-500">Reason: {post.reason}</p>}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Status: {post.status}</p>
        {post.status === "FAILED" && (
          <Button onClick={handleDelete} variant="destructive" size="sm">
            Delete
          </Button>
        )}
        {post.post_url ? (
          <Button asChild size="sm">
            <a href={post.post_url} target="_blank" rel="noopener noreferrer">
              View Post
            </a>
          </Button>
        ) : (
          post.status !== "FAILED" && (
            <Button onClick={() => refreshStatus(post.id)} disabled={isPending} size="sm">
              {isPending ? "Refreshing..." : "Refresh"}
            </Button>
          )
        )}
      </div>
    </div>
  );
};
