import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PublicHeader from "@/components/layout/PublicHeader";
import { motion } from "framer-motion";
import { useSession } from "@/features/auth/hooks/useSession";
import { useUserProfile } from "@/features/accounts/hooks/useUserProfile";
import { useUpdateOnboardingData } from "@/features/onboarding/hooks/useUpdateOnboardingData";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";
import { useEffect } from "react";

const PurchaseCompletePage = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data: userAccount, isLoading } = useUserProfile(session?.user?.id);
  const { mutate: updateOnboardingData } = useUpdateOnboardingData(session?.user?.id || "");
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: queries.user.account(session?.user?.id).queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: queries.user.subscription(session?.user?.id).queryKey,
    });
    queryClient.invalidateQueries({ queryKey: queries.plans.all().queryKey });
  }, [queryClient, session?.user?.id]);

  const isUpgrade = userAccount?.profile.onboarding_data?.hasCompletedOnboarding;

  const handleGetStarted = () => {
    if (isUpgrade) {
      navigate("/app/home");
    } else {
      updateOnboardingData(
        { hasCompletedOnboarding: true },
        {
          onSuccess: () => {
            navigate("/app/home");
          },
        }
      );
    }
  };

  const renderSuccess = () => (
    <div className="text-center flex flex-col items-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      <h2 className="text-2xl font-bold text-center mt-4">Purchase Successful!</h2>
      <p className="text-muted-foreground">Welcome to Jarvis.</p>
      <Button onClick={handleGetStarted} className="mt-8">
        {isUpgrade ? "Continue" : "Let's Get Started"}
      </Button>
    </div>
  );

  const renderLoading = () => (
    <div className="space-y-4">
      <Skeleton className="h-16 w-16 rounded-full mx-auto" />
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-6 w-1/2 mx-auto" />
      <Skeleton className="h-10 w-full mt-8" />
    </div>
  );

  const renderError = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-center">Purchase Failed</h2>
      <p className="text-muted-foreground">There was an issue with your purchase. Please try again.</p>
      <Button asChild className="mt-4">
        <Link to="/checkout">Try Again</Link>
      </Button>
    </div>
  );

  const showSuccess =
    userAccount?.profile.onboarding_data?.isFreeTier || userAccount?.profile.onboarding_data?.hasCompletedPurchase;

  return (
    <div className="bg-background text-foreground">
      <PublicHeader showNavLinks={false} />
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
          {isLoading || !userAccount ? renderLoading() : showSuccess ? renderSuccess() : renderError()}
        </div>
      </div>
    </div>
  );
};

export default PurchaseCompletePage;
