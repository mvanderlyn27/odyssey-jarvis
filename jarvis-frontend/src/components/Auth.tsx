import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/jarvisClient";
import { useUserProfile } from "@/features/accounts/hooks/useUserProfile";
import { toast } from "sonner";
import { createProfile } from "@/features/auth/api/createProfile";
import { User } from "@supabase/supabase-js";
import { useSession } from "@/features/auth/hooks/useSession";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { getPlan } from "@/features/billing/api";
import { OnboardingData } from "@/features/onboarding/types";

// Helper function to ensure a user profile exists. This logic is critical to prevent a race
// condition where the app tries to fetch a user's profile before it has been created.
const ensureUserProfileExists = async (user: User) => {
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();

  if (!profile) {
    const pendingPurchase = localStorage.getItem("pendingPurchase");
    let onboarding_data: OnboardingData | undefined;

    if (pendingPurchase) {
      try {
        const { priceId } = JSON.parse(pendingPurchase);
        if (priceId) {
          const plan = await getPlan(priceId);
          onboarding_data = {
            selectedPriceId: priceId,
            isFreeTier: plan.price === 0,
            hasCompletedPurchase: plan.price === 0,
          };
        }
      } catch (error) {
        console.error("Failed to parse pending purchase from localStorage", error);
      } finally {
        localStorage.removeItem("pendingPurchase");
      }
    }

    await createProfile({
      id: user.id,
      full_name: user.user_metadata.full_name,
      avatar_url: user.user_metadata.avatar_url,
      onboarding_data,
    });
  }
};

type AuthStatus = "loading" | "unauthenticated" | "authenticated" | "onboarding";

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isLoading: isSessionLoading } = useSession();
  const user = session?.user;
  const { data: userAccount, isLoading: isProfileLoading } = useUserProfile(user?.id);
  const { mutateAsync: logout } = useLogout();
  const navigate = useNavigate();
  const [, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const handleAuth = async () => {
      if (isSessionLoading) {
        setStatus("loading");
        return;
      }

      if (!user) {
        setStatus("unauthenticated");
        return;
      }

      try {
        await ensureUserProfileExists(user);
      } catch (error) {
        toast.error("There was an issue setting up your profile. Please try logging in again.");
        await logout();
        return;
      }

      if (isProfileLoading) {
        setStatus("loading");
        return;
      }

      if (userAccount) {
        // The ProtectedRoute component now handles all onboarding-related redirects.
        // This component's responsibility is to ensure the user is authenticated
        // and their profile exists.
        setStatus("authenticated");
      }
    };

    handleAuth();
  }, [user, userAccount, isSessionLoading, isProfileLoading, navigate, logout]);

  return <>{children}</>;
};

export default Auth;
