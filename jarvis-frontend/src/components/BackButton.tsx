import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button variant="ghost" onClick={() => navigate(-1)}>
      <ChevronLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  );
};
