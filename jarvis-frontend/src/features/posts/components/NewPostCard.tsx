import { Card } from "@/components/ui/card";
import { useEditPostStore } from "@/store/useEditPostStore";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewPostCard = () => {
  const navigate = useNavigate();
  const createNewPost = useEditPostStore((state) => state.createNewPost);

  const handleNewPostClick = () => {
    if (createNewPost()) {
      navigate("/posts/draft");
    }
  };

  return (
    <Card
      className="flex items-center justify-center w-full h-full bg-neutral-300 dark:bg-neutral-800 text-white border-none rounded-lg cursor-pointer hover:bg-neutral-400 dark:hover:bg-neutral-700 transition-colors"
      onClick={handleNewPostClick}>
      <div className="text-center">
        <PlusCircle className="w-12 h-12 mx-auto mb-2" />
        <p className="text-lg font-semibold">Create New Post</p>
      </div>
    </Card>
  );
};

export default NewPostCard;
