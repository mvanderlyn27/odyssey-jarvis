import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import SideMenu from "./components/layout/SideMenu";
import Header from "./components/layout/Header";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TikTokCallbackPage from "./pages/TikTokCallbackPage";
import TikTokAccountDetailsPage from "./pages/TikTokAccountDetailsPage";
import NewPostPage from "./pages/NewPostPage";
import PostSchedulePage from "./pages/PostSchedulePage";
import DraftsPage from "./pages/DraftsPage";
import PostDetailPage from "./pages/PostDetailPage";
import TikTokAccountsPage from "./pages/TikTokAccountsPage";
import TikTokAnalyticsPage from "./pages/TikTokAnalyticsPage";
import { Toaster } from "sonner";
import OverviewPage from "./pages/OverviewPage";
import { ThemeProvider } from "./components/theme-provider";

import { useState } from "react";

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <SideMenu isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Placeholder pages
const AdminPage = () => <div>Admin Panel Page</div>;

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/tiktok/accounts" />} />
              <Route path="tiktok/accounts" element={<TikTokAccountsPage />} />
              <Route path="tiktok/analytics" element={<TikTokAnalyticsPage />} />
              <Route path="tiktok/:accountId" element={<TikTokAccountDetailsPage />} />
              <Route path="drafts" element={<DraftsPage />} />
              <Route path="posts" element={<PostSchedulePage />} />
              <Route path="posts/new" element={<NewPostPage />} />
              <Route path="posts/:id" element={<PostDetailPage />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="admin" element={<AdminPage />} />
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
