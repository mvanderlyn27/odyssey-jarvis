import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import SideMenu from "./components/layout/SideMenu";
import Header from "./components/layout/Header";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TikTokCallbackPage from "./pages/TikTokCallbackPage";
import TikTokVideosPage from "./pages/TikTokVideosPage";
import DraftDetailPage from "./pages/DraftDetailPage";

const MainLayout = () => (
  <div className="flex h-screen bg-background">
    <SideMenu />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

import DraftsPage from "./pages/DraftsPage";
import TikTokAccountsPage from "./pages/TikTokAccountsPage";
import TikTokAnalyticsPage from "./pages/TikTokAnalyticsPage";

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
            <Route path="drafts" element={<DraftsPage />}>
              <Route path=":id" element={<DraftDetailPage />} />
            </Route>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="auth/callback" element={<TikTokCallbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
