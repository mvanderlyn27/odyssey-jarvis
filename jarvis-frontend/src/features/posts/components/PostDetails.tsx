import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "../types";

interface PostDetailsProps {
  post: Post;
  setPost: (post: Post) => void;
  setIsDirty: (isDirty: boolean) => void;
}

const PostDetails = ({ post, setPost, setIsDirty }: PostDetailsProps) => {
  if (!post) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost({ ...post, title: e.target.value });
    setIsDirty(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost({ ...post, description: e.target.value });
    setIsDirty(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`title-${post.id}`}>Title</Label>
          <Input
            id={`title-${post.id}`}
            value={post.title || ""}
            onChange={handleTitleChange}
            placeholder="Post Title"
          />
        </div>
        <div>
          <Label htmlFor={`description-${post.id}`}>Description</Label>
          <Textarea
            id={`description-${post.id}`}
            value={post.description || ""}
            onChange={handleDescriptionChange}
            placeholder="Post Description"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PostDetails;
