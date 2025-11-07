import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";
import { useUserProfile } from "@/features/accounts/hooks/useUserProfile";
import { OnboardingData } from "@/features/onboarding/types";

const ProtectedRoute = () => {
  const { data: session, isLoading: isSessionLoading } = useSession();
  const user = session?.user;
  const { data: userAccount, isLoading: isProfileLoading } = useUserProfile(user?.id);
  console.log("session loading", isSessionLoading);
  if (isSessionLoading || (user && isProfileLoading)) {
    return <div>Loading...</div>;
  }
  console.log(user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const onboardingData = userAccount?.profile.onboarding_data as OnboardingData | null;

  // If onboarding_data is null or undefined, treat as complete for existing users.
  if (onboardingData && !onboardingData.hasCompletedPurchase) {
    if (onboardingData.selectedPriceId && !onboardingData.isFreeTier) {
      return <Navigate to={`/checkout?priceId=${onboardingData.selectedPriceId}`} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
