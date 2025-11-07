export interface OnboardingData {
  selectedPriceId?: string;
  isFreeTier?: boolean;
  hasCompletedPurchase?: boolean;
  hasCompletedOnboarding?: boolean;
  hasShownWizard?: boolean;
  hasConnectedAccount?: boolean;
  hasScheduledPost?: boolean;
  purchaseError?: string;
}
