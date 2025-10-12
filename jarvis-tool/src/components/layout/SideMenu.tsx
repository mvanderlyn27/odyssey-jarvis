import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SideMenu = () => {
  return (
    <aside className="w-64 p-4 border-r">
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
    </aside>
  );
};

export default SideMenu;
