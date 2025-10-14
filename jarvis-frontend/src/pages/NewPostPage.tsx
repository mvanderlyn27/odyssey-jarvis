import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPost } from "@/features/posts/api";
import { useAuthStore } from "@/store/useAuthStore";
import { queries } from "@/lib/queries";

const NewPostPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  const userId = session?.user?.id;

  const createPostMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("User not found");
      return createPost();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queries.posts.all().queryKey });
      navigate(`/posts/${data.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create post. Please try again." + error);
      console.error(error);
      navigate("/posts");
    },
  });

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    } else {
      createPostMutation.mutate();
    }
  }, [userId, navigate]);

  return <div>Creating new post...</div>;
};

export default NewPostPage;
