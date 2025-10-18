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

import { useState, useRef } from "react";
import DraftPostPage from "./pages/DraftPostPage";
import PostOverviewPage from "./pages/PostOverviewPage";
import { ScrollContext } from "./contexts/ScrollContext";

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SideMenu isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto" ref={scrollContainerRef}>
          <ScrollContext.Provider value={scrollContainerRef}>
            <Outlet />
          </ScrollContext.Provider>
        </main>
      </div>
    </div>
  );
};

// Placeholder pages

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/home" />} />
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
            </Route>
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="auth/callback" element={<TikTokCallbackPage />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
