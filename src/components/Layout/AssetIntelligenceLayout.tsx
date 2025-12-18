import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { 
  Wrench, 
  BarChart3, 
  BookOpen, 
  Bot, 
  Menu, 
  TrendingUp,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";
import { UserMenu } from "@/components/Auth/UserMenu";

const navigation = [
  {
    section: "Core Features",
    items: [
      {
        name: "Prescriptive Maintenance",
        href: "/asset-intelligence/predictive-risk",
        icon: Wrench,
        description: "AI-powered action plans & scheduling"
      },
      {
        name: "Repair vs Replace",
        href: "/asset-intelligence/repair-replace",
        icon: TrendingUp,
        description: "Prescriptive maintenance planning"
      },
      {
        name: "Benchmarking",
        href: "/asset-intelligence/benchmarking",
        icon: BarChart3,
        description: "Performance comparison & metrics"
      }
    ]
  },
  {
    section: "Insights & Tools",
    items: [
      {
        name: "Asset Insights",
        href: "/asset-intelligence/asset-library",
        icon: BookOpen,
        description: "Cost comparisons & lifecycle analysis"
      },
      {
        name: "AI Copilot",
        href: "/asset-intelligence/copilot",
        icon: Bot,
        description: "GenAI assistant for technicians"
      }
    ]
  }
];

export const AssetIntelligenceLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const currentPage = navigation
    .flatMap(section => section.items)
    .find(item => location.pathname === item.href);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Asset Intelligence</h1>
          </div>

          {currentPage && (
            <div className="ml-8 flex items-center space-x-2 text-muted-foreground">
              <currentPage.icon size={16} />
              <span className="text-sm">{currentPage.description}</span>
            </div>
          )}

          <div className="ml-auto">
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "border-r border-border bg-muted/30 transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <SidebarNav navigation={navigation} collapsed={!sidebarOpen} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};