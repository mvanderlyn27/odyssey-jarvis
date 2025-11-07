import React from "react";
import AccountSettings from "@/features/accounts/components/AccountSettings";
import SubscriptionManager from "@/features/billing/components/SubscriptionManager";
// import OrganizationManager from "@/features/organization/components/components/OrganizationManager";

const SettingsPage: React.FC = () => {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <AccountSettings />
        <SubscriptionManager />
        {/* <OrganizationManager /> */}
      </div>
    </div>
  );
};

export default SettingsPage;
