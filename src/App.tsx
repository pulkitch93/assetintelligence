import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AssetIntelligenceLayout } from "./components/Layout/AssetIntelligenceLayout";
import { PrescriptiveMaintenance } from "./pages/AssetIntelligence/PrescriptiveMaintenance";
import { RepairReplace } from "./pages/AssetIntelligence/RepairReplace";
import { Benchmarking } from "./pages/AssetIntelligence/Benchmarking";
import { AssetInsights } from "./pages/AssetIntelligence/AssetInsights";
import { Copilot } from "./pages/AssetIntelligence/Copilot";
import Footer from "./components/Layout/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Unauthorized from "./pages/Unauthorized";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route
                  path="/asset-intelligence"
                  element={
                    <ProtectedRoute>
                      <AssetIntelligenceLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="predictive-risk" element={<PrescriptiveMaintenance />} />
                  <Route path="repair-replace" element={<RepairReplace />} />
                  <Route path="benchmarking" element={<Benchmarking />} />
                  <Route path="asset-library" element={<AssetInsights />} />
                  <Route path="copilot" element={<Copilot />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
