import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <nav className="flex flex-col py-6 px-3 space-y-8">
      <TooltipProvider delayDuration={0}>
        {navigation.map((section) => (
          <div key={section.section} className="space-y-3">
            {!collapsed && (
              <div className="px-3 mb-4">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {section.section}
                </h3>
              </div>
            )}
            
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          collapsed ? "justify-center" : "justify-start",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "bg-accent/50 text-foreground hover:bg-accent hover:text-accent-foreground"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !collapsed && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-fade-in" />
                          )}
                          
                          <div className="relative z-10 flex items-center gap-3">
                            <div
                              className={cn(
                                "flex-shrink-0 transition-transform duration-200",
                                "group-hover:rotate-12 group-hover:scale-110"
                              )}
                            >
                              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            
                            {!collapsed && (
                              <span className="text-sm font-medium truncate text-foreground">
                                {item.name}
                              </span>
                            )}
                          </div>
                          
                          {isActive && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground/40 rounded-l-full" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  
                  {collapsed && (
                    <TooltipContent side="right" className="flex flex-col gap-1 max-w-[250px]">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
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