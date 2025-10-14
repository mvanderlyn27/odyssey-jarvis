import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEditPostStore } from "@/store/useEditPostStore";

const PostDetails = () => {
  const { post, updateTitle, updateDescription } = useEditPostStore();

  if (!post) return null;

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTitle(e.target.value)}
            placeholder="Post Title"
          />
        </div>
        <div>
          <Label htmlFor={`description-${post.id}`}>Description</Label>
          <Textarea
            id={`description-${post.id}`}
            value={post.description || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDescription(e.target.value)}
            placeholder="Post Description"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PostDetails;
