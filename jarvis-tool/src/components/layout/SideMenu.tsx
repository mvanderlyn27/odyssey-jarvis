import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase as jarvisClient } from "../../lib/supabase/jarvisClient";
import { useAuthStore } from "../../store/useAuthStore";

const SideMenu = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await jarvisClient.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      setSession(null);
      navigate("/login");
    }
  };

  return (
    <aside className="w-64 p-4 border-r flex flex-col h-screen">
      <div>
        <h2 className="text-2xl font-bold mb-4">Jarvis</h2>
        <nav className="flex flex-col space-y-2">
          <Button asChild variant="ghost">
            <NavLink to="/tiktok">TikTok Analytics</NavLink>
          </Button>
          <Button asChild variant="ghost">
            <NavLink to="/drafts">TikTok Drafts</NavLink>
          </Button>
          <Button asChild variant="ghost">
            <NavLink to="/admin">Admin Panel</NavLink>
          </Button>
        </nav>
      </div>
      <div className="mt-auto">
        <Button variant="outline" onClick={handleLogout} className="w-full">
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default SideMenu;
