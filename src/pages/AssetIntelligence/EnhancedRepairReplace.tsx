import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Clock, Calculator, Activity, History, Wrench, TrendingDown, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FilterBar } from "@/components/UI/FilterBar";
import { ExportButton } from "@/components/UI/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Enhanced sample data with maintenance logs and health metrics
const mockRecommendations = [
  {
    asset_id: "HVAC-Chiller-001",
    site_id: "Hospital-Downtown",
    asset_type: "Chiller",
    age_years: 8.5,
    condition_score: 2,
    health_index: 35, // Out of 100
    remaining_useful_life_years: 2.5,
    repair_cost_usd: 15000,
    replacement_cost_usd: 120000,
    estimated_future_downtime_cost: 8000,
    break_even_months: 18,
    recommendation: "Replace",
    confidence: 0.87,
    expected_roi_3yr: 0.24,
    risk_reduction: 0.78,
    maintenance_log: [
      {
        date: "2025-08-15",
        type: "Repair",
        description: "Replace compressor seals",
        cost: 3500,
        downtime_hours: 8,
        parts_used: ["Compressor Seal Kit", "Gaskets"],
        technician: "John Smith"
      },
      {
        date: "2025-06-10", 
        type: "PM",
        description: "Quarterly maintenance inspection",
        cost: 1200,
        downtime_hours: 4,
        parts_used: ["Oil Filter", "Air Filter"],
        technician: "Mike Johnson"
      },
      {
        date: "2025-03-20",
        type: "Repair",
        description: "Fix refrigerant leak",
        cost: 2800,
        downtime_hours: 12,
        parts_used: ["Copper Tubing", "Refrigerant R-410A"],
        technician: "Sarah Wilson"
      },
      {
        date: "2024-12-05",
        type: "Capital Investment",
        description: "Upgrade control system",
        cost: 12000,
        downtime_hours: 24,
        parts_used: ["Control Panel", "Sensors", "Wiring"],
        technician: "External Contractor"
      }
    ],
    total_maintenance_cost_5yr: 42000,
    avg_annual_energy_cost: 18000,
    projected_annual_maintenance: 8500
  },
  {
    asset_id: "MRI-Scanner-002",
    site_id: "Hospital-Westside", 
    asset_type: "MRI",
    age_years: 12.2,
    condition_score: 3,
    health_index: 55,
    remaining_useful_life_years: 3.8,
    repair_cost_usd: 45000,
    replacement_cost_usd: 850000,
    estimated_future_downtime_cost: 25000,
    break_even_months: 48,
    recommendation: "Repair",
    confidence: 0.72,
    expected_roi_3yr: 0.15,
    risk_reduction: 0.45,
    maintenance_log: [
      {
        date: "2025-07-22",
        type: "PM",
        description: "Monthly helium level check and calibration",
        cost: 2500,
        downtime_hours: 6,
        parts_used: ["Helium", "Calibration Kit"],
        technician: "Lisa Chen"
      },
      {
        date: "2025-05-15",
        type: "Repair",
        description: "Replace gradient coil cooling pump",
        cost: 18000,
        downtime_hours: 16,
        parts_used: ["Cooling Pump", "Coolant"],
        technician: "External Specialist"
      }
    ],
    total_maintenance_cost_5yr: 125000,
    avg_annual_energy_cost: 45000,
    projected_annual_maintenance: 25000
  },
  {
    asset_id: "Pump-Water-003",
    site_id: "Plant-North",
    asset_type: "Pump", 
    age_years: 5.1,
    condition_score: 4,
    health_index: 78,
    remaining_useful_life_years: 7.5,
    repair_cost_usd: 3500,
    replacement_cost_usd: 28000,
    estimated_future_downtime_cost: 1200,
    break_even_months: 36,
    recommendation: "Repair",
    confidence: 0.94,
    expected_roi_3yr: 0.45,
    risk_reduction: 0.30,
    maintenance_log: [
      {
        date: "2025-09-01",
        type: "PM",
        description: "Routine inspection and bearing lubrication",
        cost: 450,
        downtime_hours: 2,
        parts_used: ["Lubricant", "Seals"],
        technician: "Tom Rodriguez"
      },
      {
        date: "2025-06-15",
        type: "PM", 
        description: "Quarterly maintenance",
        cost: 680,
        downtime_hours: 3,
        parts_used: ["Filter", "O-rings"],
        technician: "Tom Rodriguez"
      }
    ],
    total_maintenance_cost_5yr: 8500,
    avg_annual_energy_cost: 3200,
    projected_annual_maintenance: 1800
  }
];

const filterOptions = [
  {
    key: "site_id",
    label: "Site",
    type: "select" as const,
    options: ["Hospital-Downtown", "Hospital-Westside", "Plant-North", "Plant-South"]
  },
  {
    key: "asset_type", 
    label: "Asset Type",
    type: "select" as const,
    options: ["Chiller", "MRI", "Pump", "Generator", "Ventilator"]
  },
  {
    key: "recommendation",
    label: "Recommendation",
    type: "select" as const,
    options: ["Repair", "Replace", "Monitor"]
  },
  {
    key: "health_index",
    label: "Health Index",
    type: "select" as const,
    options: ["Critical (<40)", "Poor (40-60)", "Good (60-80)", "Excellent (80+)"]
  }
];

export const RepairReplace = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedAsset, setSelectedAsset] = useState<typeof mockRecommendations[0] | null>(null);
  
  const filteredRecommendations = useMemo(() => {
    return mockRecommendations.filter(rec => {
      if (filters.search && !rec.asset_id.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.site_id && rec.site_id !== filters.site_id) {
        return false;
      }
      if (filters.asset_type && rec.asset_type !== filters.asset_type) {
        return false;
      }
      if (filters.recommendation && rec.recommendation !== filters.recommendation) {
        return false;
      }
      if (filters.health_index) {
        const health = rec.health_index;
        if (filters.health_index.includes("Critical") && health >= 40) return false;
        if (filters.health_index.includes("Poor") && (health < 40 || health >= 60)) return false;
        if (filters.health_index.includes("Good") && (health < 60 || health >= 80)) return false;
        if (filters.health_index.includes("Excellent") && health < 80) return false;
      }
      return true;
    });
  }, [filters]);

  const summaryStats = useMemo(() => {
    const totalAssets = filteredRecommendations.length;
    const repairCount = filteredRecommendations.filter(r => r.recommendation === "Repair").length;
    const replaceCount = filteredRecommendations.filter(r => r.recommendation === "Replace").length;
    const totalSavings = filteredRecommendations.reduce((sum, r) => {
      return sum + (r.recommendation === "Repair" ? r.replacement_cost_usd - r.repair_cost_usd : 0);
    }, 0);
    const avgHealthIndex = Math.round(
      filteredRecommendations.reduce((sum, r) => sum + r.health_index, 0) / totalAssets
    );
    
    return { totalAssets, repairCount, replaceCount, totalSavings, avgHealthIndex };
  }, [filteredRecommendations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Replace": return "destructive";
      case "Repair": return "default";
      default: return "secondary";
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return "success";
    if (health >= 60) return "default";
    if (health >= 40) return "warning";
    return "destructive";
  };

  const getHealthLabel = (health: number) => {
    if (health >= 80) return "Excellent";
    if (health >= 60) return "Good";
    if (health >= 40) return "Poor";
    return "Critical";
  };

  // Health timeline data for selected asset
  const healthTimelineData = selectedAsset ? [
    { month: 'Jan 2024', health: 85, maintenance: false },
    { month: 'Feb 2024', health: 82, maintenance: false },
    { month: 'Mar 2024', health: 78, maintenance: true },
    { month: 'Apr 2024', health: 80, maintenance: false },
    { month: 'May 2024', health: 76, maintenance: false },
    { month: 'Jun 2024', health: 73, maintenance: true },
    { month: 'Jul 2024', health: 75, maintenance: false },
    { month: 'Aug 2024', health: 70, maintenance: false },
    { month: 'Sep 2024', health: 65, maintenance: true },
    { month: 'Oct 2024', health: 68, maintenance: false },
    { month: 'Nov 2024', health: 60, maintenance: false },
    { month: 'Dec 2024', health: 55, maintenance: true },
    { month: 'Jan 2025', health: 58, maintenance: false },
    { month: 'Feb 2025', health: 52, maintenance: false },
    { month: 'Mar 2025', health: 48, maintenance: true },
    { month: 'Apr 2025', health: 50, maintenance: false },
    { month: 'May 2025', health: 45, maintenance: false },
    { month: 'Jun 2025', health: 40, maintenance: true },
    { month: 'Jul 2025', health: 42, maintenance: false },
    { month: 'Aug 2025', health: 38, maintenance: false },
    { month: 'Sep 2025', health: selectedAsset.health_index, maintenance: false }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/asset-intelligence')}
            className="mr-4"
          >
            <Home size={20} className="mr-2" />
            Asset Intelligence
          </Button>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Repair vs Replace Analysis</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col h-[calc(100vh-64px)]">
      <FilterBar 
        filters={filterOptions}
        onFiltersChange={setFilters}
        searchPlaceholder="Search assets by ID..."
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Repair vs Replace Analysis</h1>
            <p className="text-muted-foreground">Comprehensive lifecycle and cost analysis with maintenance history</p>
          </div>
          <ExportButton 
            data={filteredRecommendations}
            filename="repair-replace-recommendations"
            formats={['csv', 'excel', 'pdf']}
          />
        </div>

        {/* Summary Cards */} 
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalAssets}</div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 bg-primary-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary">Repair Recommended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{summaryStats.repairCount}</div>
            </CardContent>
          </Card>
          
          <Card className="border-destructive/20 bg-destructive-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Replace Recommended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summaryStats.replaceCount}</div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary">Avg Health Index</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{summaryStats.avgHealthIndex}</div>
              <p className="text-xs text-primary/70">Out of 100</p>
            </CardContent>
          </Card>
          
          <Card className="border-success/20 bg-success-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-success">Potential Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(summaryStats.totalSavings)}</div>
              <p className="text-xs text-success/70">From repair decisions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Asset Lifecycle & Cost Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Health Index</TableHead>
                  <TableHead>Remaining Life</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Repair Cost</TableHead>
                  <TableHead>Replace Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecommendations.map((rec) => (
                  <TableRow key={rec.asset_id}>
                    <TableCell className="font-medium">{rec.asset_id}</TableCell>
                    <TableCell>{rec.site_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={rec.health_index} 
                          className="w-16" 
                        />
                        <Badge variant={getHealthColor(rec.health_index) as any} className="text-xs">
                          {rec.health_index}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        <span>{rec.remaining_useful_life_years} yrs</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRecommendationColor(rec.recommendation) as any}>
                        {rec.recommendation}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(rec.repair_cost_usd)}</TableCell>
                    <TableCell>{formatCurrency(rec.replacement_cost_usd)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedAsset(rec)}
                        >
                          View Details
                        </Button>
                        <Button size="sm">
                          Create Work Order
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detailed Analysis Panel */}
        {selectedAsset && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detailed Analysis: {selectedAsset.asset_id}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cost-analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
                  <TabsTrigger value="health-lifecycle">Health & Lifecycle</TabsTrigger>
                  <TabsTrigger value="maintenance-log">Maintenance Log</TabsTrigger>
                  <TabsTrigger value="financial-projection">Financial Projection</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cost-analysis" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Cost Comparison (5-Year Outlook)</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Immediate Repair Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.repair_cost_usd)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Projected Annual Maintenance:</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.projected_annual_maintenance)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Annual Energy Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.avg_annual_energy_cost)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="font-medium">5-Year Repair Path Total:</span>
                          <span className="font-bold">{formatCurrency(
                            selectedAsset.repair_cost_usd + 
                            (selectedAsset.projected_annual_maintenance * 5) + 
                            (selectedAsset.avg_annual_energy_cost * 5)
                          )}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Replacement Cost:</span>
                          <span className="font-bold">{formatCurrency(selectedAsset.replacement_cost_usd)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Decision Factors</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Asset Age:</span>
                          <span>{selectedAsset.age_years} years</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Break-even Point:</span>
                          <span>{selectedAsset.break_even_months} months</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Risk Reduction:</span>
                          <Badge variant="outline">{Math.round(selectedAsset.risk_reduction * 100)}%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Recommendation Confidence:</span>
                          <Badge variant="default">{Math.round(selectedAsset.confidence * 100)}%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="health-lifecycle" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Activity className="w-5 h-5 mr-2" />
                          Health Index
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold">{selectedAsset.health_index}</span>
                            <Badge variant={getHealthColor(selectedAsset.health_index) as any}>
                              {getHealthLabel(selectedAsset.health_index)}
                            </Badge>
                          </div>
                          <Progress value={selectedAsset.health_index} className="w-full" />
                          <p className="text-sm text-muted-foreground">Out of 100</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Clock className="w-5 h-5 mr-2" />
                          Remaining Life
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-3xl font-bold">{selectedAsset.remaining_useful_life_years}</div>
                          <p className="text-sm text-muted-foreground">Years remaining</p>
                          <Progress 
                            value={(selectedAsset.remaining_useful_life_years / (selectedAsset.age_years + selectedAsset.remaining_useful_life_years)) * 100} 
                            className="w-full" 
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Condition Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-3xl font-bold">{selectedAsset.condition_score}</div>
                          <p className="text-sm text-muted-foreground">Scale of 1-5</p>
                          <Progress value={selectedAsset.condition_score * 20} className="w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance-log" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <History className="w-5 h-5 mr-2" />
                        Maintenance History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Downtime</TableHead>
                            <TableHead>Technician</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedAsset.maintenance_log.map((log, index) => (
                            <TableRow key={index}>
                              <TableCell>{log.date}</TableCell>
                              <TableCell>
                                <Badge variant={log.type === "Capital Investment" ? "default" : log.type === "Repair" ? "destructive" : "secondary"}>
                                  {log.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div>
                                  <p className="font-medium">{log.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Parts: {log.parts_used.join(", ")}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{formatCurrency(log.cost)}</TableCell>
                              <TableCell>{log.downtime_hours}h</TableCell>
                              <TableCell>{log.technician}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="financial-projection" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-lg text-primary">Repair Scenario</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Year 1 Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.repair_cost_usd + selectedAsset.projected_annual_maintenance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Maintenance (Yrs 2-5):</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.projected_annual_maintenance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Energy Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.avg_annual_energy_cost)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-bold">5-Year Total:</span>
                          <span className="font-bold">{formatCurrency(
                            selectedAsset.repair_cost_usd + 
                            (selectedAsset.projected_annual_maintenance * 5) + 
                            (selectedAsset.avg_annual_energy_cost * 5)
                          )}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/20">
                      <CardHeader>
                        <CardTitle className="text-lg text-destructive">Replace Scenario</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Replacement Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.replacement_cost_usd)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Maintenance (New):</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.projected_annual_maintenance * 0.4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Energy (30% Savings):</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.avg_annual_energy_cost * 0.7)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-bold">5-Year Total:</span>
                          <span className="font-bold">{formatCurrency(
                            selectedAsset.replacement_cost_usd + 
                            (selectedAsset.projected_annual_maintenance * 0.4 * 5) + 
                            (selectedAsset.avg_annual_energy_cost * 0.7 * 5)
                          )}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-accent-light border-accent/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3">
                        <Calculator className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-primary">Financial Analysis Summary</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedAsset.recommendation === "Replace" 
                              ? `Replacement is recommended. The 5-year cost difference is ${formatCurrency(
                                  (selectedAsset.repair_cost_usd + (selectedAsset.projected_annual_maintenance * 5) + (selectedAsset.avg_annual_energy_cost * 5)) -
                                  (selectedAsset.replacement_cost_usd + (selectedAsset.projected_annual_maintenance * 0.4 * 5) + (selectedAsset.avg_annual_energy_cost * 0.7 * 5))
                                )}, favoring replacement due to high failure risk and maintenance costs.`
                              : `Repair is more cost-effective. Continuing with repairs saves ${formatCurrency(
                                  selectedAsset.replacement_cost_usd - 
                                  (selectedAsset.repair_cost_usd + (selectedAsset.projected_annual_maintenance * 3))
                                )} over the next 3 years with acceptable risk levels.`
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};