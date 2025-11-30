import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

interface SidebarNavProps {
  navigation: NavigationItem[];
  collapsed: boolean;
}

export const SidebarNav = ({ navigation, collapsed }: SidebarNavProps) => {
  return (
    <nav className="flex flex-col p-4 space-y-2">
      <TooltipProvider>
        {navigation.map((item) => (
          <Tooltip key={item.name} delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "h-auto p-0 w-full hover:bg-transparent",
                  collapsed && "justify-center"
                )}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center w-full px-3 py-2 space-x-3 rounded-md text-sm font-medium transition-colors text-foreground",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                      !isActive && "hover:bg-accent hover:text-accent-foreground",
                      collapsed && "space-x-0 justify-center px-2"
                    )
                  }
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </NavLink>
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="ml-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </TooltipProvider>
    </nav>
  );
};