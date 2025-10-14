import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Post Title"
          />
        </div>
        <div>
          <Label htmlFor={`description-${post.id}`}>Description</Label>
          <Input
            id={`description-${post.id}`}
            value={post.description || ""}
            onChange={(e) => updateDescription(e.target.value)}
            placeholder="Post Description"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PostDetails;
