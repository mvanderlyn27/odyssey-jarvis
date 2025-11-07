import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicHeader from "@/components/layout/PublicHeader";
import { Label } from "@/components/ui/label";
import SocialAuth from "@/features/auth/components/SocialAuth";
import { usePlans } from "@/features/billing/hooks/usePlans";
import { Plan } from "@/features/billing/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlan } from "@/features/billing/api";
import { useSignUp } from "@/features/auth/hooks/useSignUp";

const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const { data: plans, isLoading: isLoadingPlans } = usePlans();
  const { mutate: signUp, isPending: loading, isError, error } = useSignUp();

  const priceId = searchParams.get("priceId");
  const freePlan = plans?.find((plan: Plan) => plan.price === 0);
  const selectedPlanId = priceId || freePlan?.id;
  const selectedPlan = plans?.find((plan: Plan) => plan.id === selectedPlanId);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const planId = priceId || freePlan?.id;
    if (!planId) {
      console.error("No plan selected and no free plan found.");
      return;
    }

    let redirectTo = `${window.location.origin}/checkout?priceId=${planId}`;
    let isFreeTier = false;
    try {
      const plan = await getPlan(planId);
      if (plan.price === 0) {
        redirectTo = `${window.location.origin}/purchase-complete?status=success`;
        isFreeTier = true;
      }
    } catch (err) {
      console.error("Error fetching plan details:", err);
      return;
    }

    signUp(
      {
        credentials: {
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
        },
        onboardingData: {
          selectedPriceId: planId,
          isFreeTier,
        },
      },
      {
        onSuccess: () => {
          setStatus("awaiting_email_confirmation");
        },
      }
    );
  };

  if (status === "awaiting_email_confirmation") {
    return (
      <div className="bg-background text-foreground">
        <PublicHeader showNavLinks={false} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
          <div className="w-full max-w-md p-8 space-y-6 text-center bg-card rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-muted-foreground">
              We've sent a confirmation link to <strong>{email}</strong>. Please click the link to activate your account
              and complete your subscription.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <PublicHeader showNavLinks={false} />
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center">Create an Account</h2>
          {selectedPlan && (
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{selectedPlan.name} Plan</h3>
                  <p className="text-sm text-muted-foreground">You've selected the {selectedPlan.name} plan.</p>
                </div>
                <Link to="/#pricing" className="text-sm text-primary hover:underline">
                  Change Plan
                </Link>
              </div>
            </div>
          )}
          {isLoadingPlans && !selectedPlan && (
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          )}
          <SocialAuth type="signUp" />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up & Continue"}
            </Button>
            {isError && <p className="text-red-500 text-sm text-center">{error.message}</p>}
          </form>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
