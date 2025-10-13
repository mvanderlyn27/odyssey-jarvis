import { Button } from "@/components/ui/button";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  return (
    <header className="p-4 border-b flex items-center">
      <Button variant="ghost" onClick={onToggleSidebar} className="mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>
      <h1 className="text-xl font-semibold">Welcome to Jarvis</h1>
    </header>
  );
};

export default Header;
