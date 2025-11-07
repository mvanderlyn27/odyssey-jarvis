import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserPlan } from "../hooks/useUserPlan";
import { Button } from "@/components/ui/button";
import { useUserSubscription } from "../hooks/useUserSubscription";
import { useSession } from "@/features/auth/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import UpgradeModalContent from "./UpgradeModalContent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SubscriptionDetails from "./SubscriptionDetails";
import SubscriptionManagerSkeleton from "./SubscriptionManagerSkeleton";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";
import { format } from "date-fns";
import { toast } from "sonner";

const cancelSubscription = async () => {
  const { error } = await supabase.functions.invoke("cancel-subscription");
  if (error) throw new Error(error.message);
};

const reactivateSubscription = async () => {
  const { error } = await supabase.functions.invoke("reactivate-subscription");
  if (error) throw new Error(error.message);
};

const SubscriptionManager: React.FC = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data: subscription, isLoading, isFetching } = useUserSubscription();
  const { plan } = useUserPlan();
  const queryClient = useQueryClient();

  console.log("Subscription Data:", subscription);
  console.log("Plan Data:", plan);

  const handleRefresh = () => {
    toast.info("Refreshing subscription details...");
    queryClient.invalidateQueries({ queryKey: queries.user.subscription(session?.user?.id).queryKey });
    queryClient.invalidateQueries({ queryKey: queries.plans.all().queryKey });
  };

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast.success("Subscription canceled successfully.");
      queryClient.invalidateQueries({ queryKey: queries.user.subscription(session?.user?.id).queryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateSubscription,
    onSuccess: () => {
      toast.success("Subscription reactivated successfully.");
      queryClient.invalidateQueries({ queryKey: queries.user.subscription(session?.user?.id).queryKey });
      queryClient.invalidateQueries({ queryKey: queries.plans.all().queryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <SubscriptionManagerSkeleton />;
  }

  const renewalDate = subscription?.current_period_ends_at
    ? format(new Date(subscription.current_period_ends_at), "MMMM dd, yyyy")
    : null;

  const renderNoSubscription = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button">Choose a Plan</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="sr-only">Choose a Plan</DialogTitle>
        <UpgradeModalContent
          currentPlanId={plan?.id}
          onUpgrade={(priceId) => navigate(`/checkout?priceId=${priceId}`)}
        />
      </DialogContent>
    </Dialog>
  );

  const renderCanceledSubscription = () => (
    <div>
      <p className="mb-2">
        Your <strong>{plan?.name}</strong> plan is set to expire on <strong>{renewalDate}</strong>.
      </p>
      <Button onClick={() => reactivateMutation.mutate()} disabled={reactivateMutation.isPending}>
        {reactivateMutation.isPending ? "Reactivating..." : "Reactivate Subscription"}
      </Button>
    </div>
  );

  const renderActiveSubscription = () => (
    <div className="space-y-4">
      <div>
        <p>
          You are on the <strong>{plan?.name}</strong> plan.
        </p>
        <p className="text-sm text-gray-500">Your subscription will renew on {renewalDate}.</p>
      </div>
      <div className="flex space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Details</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogTitle className="sr-only">Subscription Details</DialogTitle>
            <SubscriptionDetails />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Change Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogTitle className="sr-only">Change Plan</DialogTitle>
            <UpgradeModalContent
              currentPlanId={plan?.id}
              onUpgrade={(priceId) => navigate(`/checkout?priceId=${priceId}`)}
            />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Cancel Subscription</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to cancel?</DialogTitle>
              <DialogDescription>
                You will still have access to your plan until the current subscription period they paid for ends on{" "}
                <strong>{renewalDate}</strong>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Go Back</Button>
              </DialogClose>
              <Button onClick={() => cancelMutation.mutate()} variant="destructive" disabled={cancelMutation.isPending}>
                {cancelMutation.isPending ? "Canceling..." : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your billing and subscription details.</CardDescription>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!subscription && renderNoSubscription()}
        {subscription && subscription.cancel_at_period_end && renderCanceledSubscription()}
        {subscription && !subscription.cancel_at_period_end && renderActiveSubscription()}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;
