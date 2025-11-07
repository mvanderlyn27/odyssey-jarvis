import { Card } from "@/components/ui/card";
import { useEditPostStore } from "@/store/useEditPostStore";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NewPostCardProps {
  onClick?: () => void;
  disabled?: boolean;
}

const NewPostCard: React.FC<NewPostCardProps> = ({ onClick, disabled = false }) => {
  const navigate = useNavigate();
  const createNewPost = useEditPostStore((state) => state.createNewPost);

  const handleNewPostClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else {
      if (createNewPost()) {
        navigate("/posts/draft");
      }
    }
  };

  return (
    <Card
      id="create-new-post-card"
      className={cn(
        "flex items-center justify-center w-full h-full bg-neutral-300 dark:bg-neutral-800 text-white border-none rounded-lg transition-colors",
        {
          "cursor-pointer hover:bg-neutral-400 dark:hover:bg-neutral-700": !disabled,
          "opacity-50 cursor-not-allowed": disabled,
        }
      )}
      onClick={handleNewPostClick}>
      <div className="text-center">
        <PlusCircle className="w-12 h-12 mx-auto mb-2" />
        <p className="text-lg font-semibold">Create New Post</p>
      </div>
    </Card>
  );
};

export default NewPostCard;
