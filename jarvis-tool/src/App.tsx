import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import SideMenu from "./components/layout/SideMenu";
import Header from "./components/layout/Header";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TikTokPage from "./pages/TikTokPage";
import TikTokCallbackPage from "./pages/TikTokCallbackPage";

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

// Placeholder pages
const DraftsPage = () => <div>TikTok Drafts Page</div>;
const AdminPage = () => <div>Admin Panel Page</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/tiktok" />} />
            <Route path="tiktok" element={<TikTokPage />} />
            <Route path="drafts" element={<DraftsPage />} />
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
