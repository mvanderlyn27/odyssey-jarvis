import { useState, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/features/accounts/hooks/useUserProfile";
import { useUpdateOnboardingData } from "../hooks/useUpdateOnboardingData";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";
import { OnboardingData } from "../types";

interface OnboardingStep {
  title: string;
  content: string;
  targetSelector?: string;
  path?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Link Your TikTok Account",
    content: "Link your TikTok accounts to start tracking analytics and scheduling posts.",
    targetSelector: "#link-tiktok-account-button",
    path: "/app/home",
  },
  {
    title: "Create a Draft",
    content: "Create your first draft post here. You can add assets, write captions, and more.",
    targetSelector: "#create-new-post-card",
    path: "/app/drafts",
  },
  {
    title: "Schedule Your Post",
    content: "After you save a draft, you can schedule it to your accounts from this page.",
    targetSelector: "#scheduler-post-list",
    path: "/app/schedule",
  },
  {
    title: "Get Support",
    content: "If you have any questions, you can always visit our support page for help.",
    targetSelector: "#faq-section",
    path: "/app/support",
  },
  {
    title: "You're All Set!",
    content: "You can now start using Jarvis to manage your social media.",
    path: "/app/home",
  },
];

const OnboardingWizard = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: userProfile } = useUserProfile(user?.id);
  const { mutate: updateOnboardingData } = useUpdateOnboardingData(user?.id || "");
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<DOMRect | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  // const forceShowOnboarding = false;

  const step = steps[currentStep];

  useLayoutEffect(() => {
    if (!session) {
      return;
    }

    const findElement = () => {
      if (step.targetSelector) {
        const element = document.querySelector(step.targetSelector);
        if (element) {
          setHighlightedElement(element.getBoundingClientRect());
        } else {
          // Retry if the element is not found immediately
          setTimeout(findElement, 100);
        }
      } else {
        setHighlightedElement(null);
      }
    };

    const onboardingData = userProfile?.profile.onboarding_data as OnboardingData | null;
    if (userProfile && onboardingData?.hasCompletedOnboarding && !onboardingData?.hasShownWizard) {
      if (step.path && location.pathname !== step.path) {
        navigate(step.path);
      }
    }

    findElement();
  }, [currentStep, step.targetSelector, step.path, navigate, session, userProfile, location.pathname]);

  const handleComplete = () => {
    if (userProfile) {
      const currentOnboardingData = (userProfile.profile.onboarding_data as OnboardingData) || {};
      updateOnboardingData({
        ...currentOnboardingData,
        hasShownWizard: true,
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const tooltipPosition = {
    top: highlightedElement ? highlightedElement.bottom + 10 : "50%",
    left: highlightedElement ? highlightedElement.left : "50%",
    transform: highlightedElement ? "none" : "translate(-50%, -50%)",
  };

  const onboardingData = userProfile?.profile.onboarding_data as OnboardingData | null;
  if (
    !session ||
    !userProfile ||
    !onboardingData?.hasCompletedOnboarding ||
    onboardingData?.hasShownWizard ||
    location.pathname.startsWith("/purchase")
  ) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50">
      {highlightedElement && (
        <div
          className="fixed rounded-lg border-4 border-blue-500"
          style={{
            left: highlightedElement.left - 4,
            top: highlightedElement.top - 4,
            width: highlightedElement.width + 8,
            height: highlightedElement.height + 8,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          }}
        />
      )}
      {!highlightedElement && <div className="fixed inset-0 bg-black bg-opacity-50" />}
      <div className="absolute" style={tooltipPosition}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{step.content}</p>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleNext}>{currentStep < steps.length - 1 ? "Next" : "Finish"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>,
    document.body
  );
};

export default OnboardingWizard;
