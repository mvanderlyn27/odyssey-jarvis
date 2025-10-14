import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPost } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { useNavigate } from "react-router-dom";

const PostCreator = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: queries.posts.drafts().queryKey });
      navigate(`/posts/${newPost.id}`);
    },
  });

  const handleCreatePost = () => {
    mutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCreatePost} disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create New Post"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PostCreator;
