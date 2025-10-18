import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/home") return "Welcome to Jarvis";
    if (path.startsWith("/tiktok")) return "Account Details";
    if (path === "/drafts") return "Drafts";
    if (path === "/schedule") return "Scheduler";
    if (path.startsWith("/posts")) return "Post Details";
    if (path === "/overview") return "Post Overview";
    return "Jarvis";
  };

  return (
    <header className="p-4 border-b flex items-center">
      <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
    </header>
  );
};

export default Header;
