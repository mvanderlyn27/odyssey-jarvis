import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

interface PublicHeaderProps {
  showNavLinks?: boolean;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ showNavLinks = false }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center w-full px-4">
        <a href="/" className="flex items-center mr-auto">
          <span className="text-2xl font-bold">Jarvis</span>
        </a>
        {showNavLinks && (
          <div className="flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink onClick={() => scrollToSection("features")} className="cursor-pointer px-4">
                    Features
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink onClick={() => scrollToSection("testimonials")} className="cursor-pointer px-4">
                    Testimonials
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink onClick={() => scrollToSection("pricing")} className="cursor-pointer px-4">
                    Pricing
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink onClick={() => scrollToSection("contact")} className="cursor-pointer px-4">
                    Contact
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}
        <div className="ml-auto">
          {showNavLinks ? (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          ) : (
            <></>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
