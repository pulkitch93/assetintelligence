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

interface NavigationSection {
  section: string;
  items: NavigationItem[];
}

interface SidebarNavProps {
  navigation: NavigationSection[];
  collapsed: boolean;
}

export const SidebarNav = ({ navigation, collapsed }: SidebarNavProps) => {
  return (
    <nav className="flex flex-col p-4 space-y-6">
      <TooltipProvider>
        {navigation.map((section) => (
          <div key={section.section} className="space-y-2">
            {!collapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.section}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
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
                            "flex items-center w-full px-3 py-2.5 space-x-3 rounded-lg text-sm font-medium transition-all duration-200",
                            "hover:bg-accent/50",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
                              : "text-card-foreground hover:text-accent-foreground",
                            collapsed && "space-x-0 justify-center px-2"
                          )
                        }
                      >
                        <item.icon 
                          size={20} 
                          className="flex-shrink-0" 
                        />
                        {!collapsed && (
                          <span>{item.name}</span>
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
            </div>
          </div>
        ))}
      </TooltipProvider>
    </nav>
  );
};