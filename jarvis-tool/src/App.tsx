import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import SideMenu from "./components/layout/SideMenu";
import Header from "./components/layout/Header";

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

import TikTokPage from "./pages/TikTokPage";
import TikTokCallbackPage from "./pages/TikTokCallbackPage";

// Placeholder pages
const DraftsPage = () => <div>TikTok Drafts Page</div>;
const AdminPage = () => <div>Admin Panel Page</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="tiktok" element={<TikTokPage />} />
          <Route path="drafts" element={<DraftsPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="auth/callback" element={<TikTokCallbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
