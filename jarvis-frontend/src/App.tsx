import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import SideMenu from "./components/layout/SideMenu";
import Header from "./components/layout/Header";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TikTokCallbackPage from "./pages/TikTokCallbackPage";
import TikTokAccountDetailsPage from "./pages/TikTokAccountDetailsPage";
import PostSchedulePage from "./pages/PostSchedulePage";
import DraftsPage from "./pages/DraftsPage";
import PostDetailPage from "./pages/PostDetailPage";
import TikTokAccountsPage from "./pages/TikTokAccountsPage";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";
import ErrorBoundary from "./components/ErrorBoundary";

import { useRef, useState } from "react";
import DraftPostPage from "./pages/DraftPostPage";
import PostOverviewPage from "./pages/PostOverviewPage";
import DayDetailPage from "./pages/DayDetailPage";
import { ScrollContext } from "./contexts/ScrollContext";
import LandingPage from "./pages/LandingPage";
import SettingsPage from "./pages/SettingsPage";
import Auth from "./components/Auth";
import AdminPage from "./pages/AdminPage";
import SignUpPage from "./pages/SignUpPage";
import SupportPage from "./pages/SupportPage";
import PublicRoute from "./components/PublicRoute";
import CheckoutPage from "./pages/CheckoutPage";
import PurchaseCompletePage from "./pages/PurchaseCompletePage";
import OnboardingWizard from "./features/onboarding/components/OnboardingWizard";
import { useSession } from "./features/auth/hooks/useSession";
import { useUserProfile } from "./features/accounts/hooks/useUserProfile";
import FeatureGateModal from "./features/billing/components/FeatureGateModal";

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const { data: session } = useSession();
  const { data: userAccount } = useUserProfile(session?.user?.id);

  const showOnboarding =
    userAccount?.profile.onboarding_data?.hasCompletedOnboarding &&
    !userAccount?.profile.onboarding_data?.hasShownWizard;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SideMenu isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
          <ScrollContext.Provider value={scrollContainerRef}>
            {showOnboarding ? <OnboardingWizard /> : <></>}
            <Outlet />
          </ScrollContext.Provider>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Auth>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route index element={<Navigate to="/app/home" />} />
                <Route path="home" element={<TikTokAccountsPage />} />
                <Route
                  path="tiktok/:accountId"
                  element={
                    <ErrorBoundary>
                      <TikTokAccountDetailsPage />
                    </ErrorBoundary>
                  }
                />
                <Route path="drafts" element={<DraftsPage />} />
                <Route path="schedule" element={<PostSchedulePage />} />
                <Route path="posts/draft" element={<DraftPostPage />} />
                <Route path="posts/:id" element={<PostDetailPage />} />
                <Route path="overview" element={<PostOverviewPage />} />
                <Route path="day/:date" element={<DayDetailPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="admin" element={<AdminPage />} />
              </Route>
            </Route>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/purchase-complete" element={<PurchaseCompletePage />} />
            <Route path="auth/callback" element={<TikTokCallbackPage />} />
          </Routes>
          <Toaster />
          <FeatureGateModal />
        </Auth>
      </Router>
    </ThemeProvider>
  );
}

export default App;
