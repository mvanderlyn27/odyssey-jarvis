import { useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createCheckoutSession } from "../api";
import { useSession } from "@/features/auth/hooks/useSession";

const PaymentForm = () => {
  const stripe = useStripe();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe) {
      return;
    }

    if (!session) {
      setError("Your session has expired. Please refresh the page and try again.");
      setLoading(false);
      return;
    }

    const priceId = searchParams.get("priceId");
    if (!priceId) {
      setError("Price ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const { url } = await createCheckoutSession(priceId, `${window.location.origin}/purchase-complete`);
      if (url) {
        window.location.href = url;
      } else {
        setError("Could not create a checkout session. Please try again.");
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" className="w-full" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Proceed to Checkout"}
      </Button>
      {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
    </form>
  );
};

export default PaymentForm;
