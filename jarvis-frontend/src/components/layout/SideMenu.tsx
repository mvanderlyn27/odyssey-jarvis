import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase as jarvisClient } from "../../lib/supabase/jarvisClient";
import { useAuthStore } from "../../store/useAuthStore";
import { ModeToggle } from "../mode-toggle";

interface SideMenuProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SideMenu = ({ isCollapsed, onToggle }: SideMenuProps) => {
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
    <aside
      className={`p-4 border-r flex flex-col h-screen transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className="flex items-center justify-between">
        {!isCollapsed && <h2 className="text-2xl font-bold">Jarvis</h2>}
        <Button variant="ghost" onClick={onToggle}>
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </Button>
      </div>
      <nav className="flex flex-col space-y-2 mt-4">
        <NavLink to="/home">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "🏠" : "Home"}
            </Button>
          )}
        </NavLink>
        <NavLink to="/drafts">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "✍️" : "Drafts"}
            </Button>
          )}
        </NavLink>
        <NavLink to="/schedule">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "🗓️" : "Scheduler"}
            </Button>
          )}
        </NavLink>
        <NavLink to="/overview">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "📊" : "Post Overview"}
            </Button>
          )}
        </NavLink>
      </nav>
      <div className="mt-auto space-y-2 border-t pt-4">
        <ModeToggle />
        <Button variant="outline" onClick={handleLogout} className="w-full">
          {isCollapsed ? "🚪" : "Logout"}
        </Button>
      </div>
    </aside>
  );
};

export default SideMenu;
