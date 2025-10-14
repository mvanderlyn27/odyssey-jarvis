import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import SideMenu from "./components/layout/SideMenu";
import Header from "./components/layout/Header";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TikTokCallbackPage from "./pages/TikTokCallbackPage";
import TikTokVideosPage from "./pages/TikTokVideosPage";
import PostEditor from "./features/posts/components/PostEditor";
import InboxPage from "./pages/InboxPage";

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

import { PostsPage } from "./pages/PostsPage";
import NewPostPage from "./pages/NewPostPage";
import TikTokAccountsPage from "./pages/TikTokAccountsPage";
import TikTokAnalyticsPage from "./pages/TikTokAnalyticsPage";
import { Toaster } from "sonner";

// Placeholder pages
const AdminPage = () => <div>Admin Panel Page</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/tiktok/accounts" />} />
            <Route path="tiktok/accounts" element={<TikTokAccountsPage />} />
            <Route path="tiktok/analytics" element={<TikTokAnalyticsPage />} />
            <Route path="tiktok/:openId" element={<TikTokVideosPage />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="posts/new" element={<NewPostPage />} />
            <Route path="posts/:id" element={<PostEditor />} />
            <Route path="inbox" element={<InboxPage />} />
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
  );
}

export default App;
