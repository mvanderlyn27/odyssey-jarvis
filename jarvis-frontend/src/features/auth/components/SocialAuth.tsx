import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { useOAuth } from "../hooks/useOAuth";

interface SocialAuthProps {
  type: "signIn" | "signUp";
}

const SocialAuth = ({ type }: SocialAuthProps) => {
  const [searchParams] = useSearchParams();
  const { mutate, isPending } = useOAuth(type);

  const handleAuth = () => {
    const priceId = searchParams.get("priceId");
    mutate(priceId);
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleAuth} disabled={isPending}>
      {isPending ? "Redirecting..." : type === "signIn" ? "Sign In with Google" : "Sign Up with Google"}
    </Button>
  );
};

export default SocialAuth;
