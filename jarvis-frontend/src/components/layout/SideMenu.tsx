import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../mode-toggle";
import { useLogout } from "@/features/auth/hooks/useLogout";

interface SideMenuProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SideMenu = ({ isCollapsed, onToggle }: SideMenuProps) => {
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
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
        <NavLink to="/app/home">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "🏠" : "Home"}
            </Button>
          )}
        </NavLink>
        <NavLink to="/app/drafts">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "✍️" : "Drafts"}
            </Button>
          )}
        </NavLink>
        <NavLink to="/app/schedule">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "🗓️" : "Scheduler"}
            </Button>
          )}
        </NavLink>
        <NavLink to="/app/overview">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "📊" : "Post Overview"}
            </Button>
          )}
        </NavLink>
        <NavLink to="/app/settings">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "⚙️" : "Settings"}
            </Button>
          )}
        </NavLink>
        <NavLink to="/app/support">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
              {isCollapsed ? "❓" : "Support"}
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
