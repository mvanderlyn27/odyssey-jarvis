import { useUserAccount } from "@/features/accounts/hooks/useUserAccount";

const BillingPage = () => {
  const { data: userAccount, isLoading, error } = useUserAccount();

  const handleCheckout = async (priceId: string) => {
    // Logic to call the `create-checkout-session` Edge Function
    // and redirect to Stripe's checkout page.
    console.log(`Creating checkout session for price: ${priceId}`);
  };

  if (isLoading) {
    return <div className="p-4">Loading subscription details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Your Subscription</h1>

      {userAccount?.plan ? (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold">Your Current Plan</h2>
          <p className="text-lg font-bold">{userAccount.plan.name}</p>
          <p>{userAccount.plan.description}</p>
          <button className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">Manage Subscription</button>
        </div>
      ) : (
        <div className="mb-8 p-4 border rounded-lg bg-gray-100">
          <h2 className="text-xl font-semibold">You are on the Free plan.</h2>
          <p>Upgrade to unlock more features.</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Example Plan Cards - In a real app, these would be fetched dynamically */}
        <div>
          <h2 className="text-xl font-semibold">Indie Plan</h2>
          <p>$29/month</p>
          <button
            onClick={() => handleCheckout("price_indie_plan")}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            disabled={userAccount?.plan?.name === "Indie"}>
            {userAccount?.plan?.name === "Indie" ? "Current Plan" : "Subscribe"}
          </button>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Pro Plan</h2>
          <p>$99/month</p>
          <button
            onClick={() => handleCheckout("price_pro_plan")}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            disabled={userAccount?.plan?.name === "Pro"}>
            {userAccount?.plan?.name === "Pro" ? "Current Plan" : "Subscribe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
