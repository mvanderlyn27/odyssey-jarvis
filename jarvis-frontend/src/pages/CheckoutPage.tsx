import { useSearchParams, useNavigate } from "react-router-dom";
import { usePlan } from "@/features/billing/hooks/usePlan";
import { Button } from "@/components/ui/button";
import PublicHeader from "@/components/layout/PublicHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";

const createCheckoutSession = async ({ priceId, returnUrl }: { priceId: string; returnUrl: string }) => {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { priceId, returnUrl },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const priceId = searchParams.get("priceId");
  const { data: plan, isLoading } = usePlan(priceId || undefined);

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (!priceId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No plan selected.</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <PublicHeader showNavLinks={false} />
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center">Checkout</h2>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : plan ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold">{plan.name} Plan</h3>
                <p className="text-2xl font-bold">
                  ${plan.price ? plan.price : "0"}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
              </div>
              <Button
                onClick={() => {
                  const returnUrl = `${window.location.origin}/purchase-complete`;
                  createSession({ priceId, returnUrl });
                }}
                className="w-full"
                disabled={isPending}>
                {isPending ? "Redirecting to Stripe..." : "Confirm and Pay"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
                Back
              </Button>
            </div>
          ) : (
            <p>Plan not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
