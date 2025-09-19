import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Wrench, 
  Clock,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight
} from "lucide-react";

// Mock data for demonstration
const mockAssets = [
  {
    id: "CHILLER-001",
    name: "Industrial Chiller #1",
    age: 10,
    condition_score: 65,
    repair_cost: 45000,
    replacement_cost: 180000,
    estimated_downtime_cost: 12000,
    remaining_lifecycle: 3,
    usage_rate: 85,
    criticality: "High",
    lead_time: "12 weeks",
    safety_risk: "Medium",
    maintenance_history: [
      { date: "2024-01-15", type: "Repair", cost: 8500, description: "Compressor seal replacement", parts: ["Seal Kit SK-401", "Gasket GK-202"] },
      { date: "2023-09-22", type: "Maintenance", cost: 2800, description: "Refrigerant recharge", parts: ["R410A Refrigerant"] },
      { date: "2023-06-10", type: "Repair", cost: 15200, description: "Evaporator coil replacement", parts: ["Evaporator Coil EC-885", "Insulation IN-445"] },
      { date: "2023-03-05", type: "Capital", cost: 25000, description: "Control system upgrade", parts: ["Control Module CM-991", "Sensors Pack SP-223"] }
    ],
    projected_costs: {
      repair: [45000, 52000, 58000, 65000, 72000],
      replace: [180000, 8000, 8500, 9000, 9500]
    }
  },
  {
    id: "PUMP-003",
    name: "Cooling Tower Pump #3",
    age: 8,
    condition_score: 78,
    repair_cost: 12000,
    replacement_cost: 45000,
    estimated_downtime_cost: 8000,
    remaining_lifecycle: 5,
    usage_rate: 92,
    criticality: "Medium",
    lead_time: "6 weeks",
    safety_risk: "Low",
    maintenance_history: [
      { date: "2024-02-20", type: "Maintenance", cost: 1500, description: "Bearing lubrication", parts: ["Bearing Grease BG-101"] },
      { date: "2023-11-08", type: "Repair", cost: 4200, description: "Impeller replacement", parts: ["Impeller IM-334", "Shaft Seal SS-112"] },
      { date: "2023-07-18", type: "Maintenance", cost: 800, description: "Motor alignment", parts: [] }
    ],
    projected_costs: {
      repair: [12000, 14000, 16000, 18000, 20000],
      replace: [45000, 3000, 3200, 3400, 3600]
    }
  }
];

const costComparisonData = (asset: any) => [
  { year: "Year 1", repair: asset.projected_costs.repair[0], replace: asset.projected_costs.replace[0] },
  { year: "Year 2", repair: asset.projected_costs.repair[1], replace: asset.projected_costs.replace[1] },
  { year: "Year 3", repair: asset.projected_costs.repair[2], replace: asset.projected_costs.replace[2] },
  { year: "Year 4", repair: asset.projected_costs.repair[3], replace: asset.projected_costs.replace[3] },
  { year: "Year 5", repair: asset.projected_costs.repair[4], replace: asset.projected_costs.replace[4] }
];

export const RepairReplace = () => {
  const [selectedAsset, setSelectedAsset] = useState(mockAssets[0]);
  const [selectedScenario, setSelectedScenario] = useState<"repair" | "replace">("repair");

  const calculateBreakEven = (asset: any) => {
    const repairCosts = asset.projected_costs.repair;
    const replaceCosts = asset.projected_costs.replace;
    let cumulativeRepair = 0;
    let cumulativeReplace = 0;
    
    for (let i = 0; i < repairCosts.length; i++) {
      cumulativeRepair += repairCosts[i];
      cumulativeReplace += replaceCosts[i];
      
      if (cumulativeReplace < cumulativeRepair) {
        return i + 1;
      }
    }
    return null;
  };

  const getRecommendation = (asset: any) => {
    const totalRepairCost = asset.projected_costs.repair.reduce((a: number, b: number) => a + b, 0);
    const totalReplaceCost = asset.projected_costs.replace.reduce((a: number, b: number) => a + b, 0);
    const breakEven = calculateBreakEven(asset);
    
    if (totalReplaceCost < totalRepairCost || asset.condition_score < 70) {
      return {
        action: "Replace",
        reason: `Replacement recommended: ${totalReplaceCost < totalRepairCost ? 'Lower 5-year total cost' : 'Poor condition score'}`,
        savings: Math.abs(totalRepairCost - totalReplaceCost),
        urgency: asset.condition_score < 60 ? "Immediate" : "Next Quarter"
      };
    }
    
    return {
      action: "Repair",
      reason: "Repair is more cost-effective for remaining lifecycle",
      savings: Math.abs(totalRepairCost - totalReplaceCost),
      urgency: "As Needed"
    };
  };

  const healthIndexColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Repair vs Replace Analysis</h1>
          <p className="text-muted-foreground">AI-powered recommendations for asset lifecycle decisions</p>
        </div>
      </div>

      {/* Asset Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Asset for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAssets.map((asset) => (
              <Card 
                key={asset.id}
                className={`cursor-pointer transition-colors ${selectedAsset.id === asset.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                onClick={() => setSelectedAsset(asset)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{asset.name}</h3>
                      <p className="text-sm text-muted-foreground">{asset.id}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={asset.criticality === "High" ? "destructive" : asset.criticality === "Medium" ? "secondary" : "outline"}>
                          {asset.criticality}
                        </Badge>
                        <span className="text-sm">Age: {asset.age} years</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${healthIndexColor(asset.condition_score)}`}>
                        {asset.condition_score}%
                      </div>
                      <p className="text-xs text-muted-foreground">Health Index</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Recommendation Card */}
        <Card className="lg:col-span-2 h-80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col">
            {(() => {
              const rec = getRecommendation(selectedAsset);
              return (
                <div className="space-y-3 flex-1">
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {rec.action === "Replace" ? <XCircle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                          <span className="font-semibold text-sm">{rec.action} {selectedAsset.name}</span>
                        </div>
                        <p className="text-xs">{rec.reason}</p>
                        <div className="flex justify-between text-xs">
                          <span>Savings:</span>
                          <span className="font-semibold text-green-600">${rec.savings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Timeline:</span>
                          <span className="font-semibold">{rec.urgency}</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2 flex-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Health Index</span>
                        <span className={healthIndexColor(selectedAsset.condition_score)}>{selectedAsset.condition_score}%</span>
                      </div>
                      <Progress value={selectedAsset.condition_score} className="h-1.5" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Remaining Lifecycle</span>
                        <span>{selectedAsset.remaining_lifecycle} years</span>
                      </div>
                      <Progress value={(selectedAsset.remaining_lifecycle / 10) * 100} className="h-1.5" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mt-auto">
                      <div>
                        <span className="text-muted-foreground">Lead Time:</span>
                        <p className="font-semibold">{selectedAsset.lead_time}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Safety Risk:</span>
                        <p className="font-semibold">{selectedAsset.safety_risk}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Cost Comparison Chart */}
        <Card className="lg:col-span-3 h-80">
          <CardHeader className="pb-2">
            <CardTitle>5-Year Cost Projection</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Cost comparison table */}
              <div className="grid grid-cols-6 gap-2 text-sm">
                <div className="font-semibold text-muted-foreground">Option</div>
                <div className="font-semibold text-center">Year 1</div>
                <div className="font-semibold text-center">Year 2</div>
                <div className="font-semibold text-center">Year 3</div>
                <div className="font-semibold text-center">Year 4</div>
                <div className="font-semibold text-center">Year 5</div>
                
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded"></div>
                  <span>Repair</span>
                </div>
                {selectedAsset.projected_costs.repair.map((cost, index) => (
                  <div key={index} className="text-center font-mono">
                    ${(cost / 1000).toFixed(0)}K
                  </div>
                ))}
                
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded"></div>
                  <span>Replace</span>
                </div>
                {selectedAsset.projected_costs.replace.map((cost, index) => (
                  <div key={index} className="text-center font-mono">
                    ${(cost / 1000).toFixed(0)}K
                  </div>
                ))}
              </div>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="text-sm text-muted-foreground">5-Year Repair Total</div>
                  <div className="text-2xl font-bold text-destructive">
                    ${selectedAsset.projected_costs.repair.reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-sm text-muted-foreground">5-Year Replace Total</div>
                  <div className="text-2xl font-bold text-primary">
                    ${selectedAsset.projected_costs.replace.reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Key Insight Box */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="text-sm">
                    {(() => {
                      const breakEven = calculateBreakEven(selectedAsset);
                      return breakEven ? (
                        <span className="text-blue-800 dark:text-blue-200">
                          <strong>💡 Key Insight:</strong> Break-even point at Year {breakEven} - Replacement becomes more cost-effective
                        </span>
                      ) : (
                        <span className="text-green-800 dark:text-green-200">
                          <strong>💡 Key Insight:</strong> Repair remains cost-effective throughout the 5-year period
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis: {selectedAsset.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="maintenance-history" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="maintenance-history">Maintenance History</TabsTrigger>
              <TabsTrigger value="cost-breakdown">Cost Breakdown</TabsTrigger>
              <TabsTrigger value="scenario-planning">Scenario Planning</TabsTrigger>
              <TabsTrigger value="risk-factors">Risk Factors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="maintenance-history" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Maintenance Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {selectedAsset.maintenance_history.map((entry, index) => (
                          <div key={index} className="border-l-2 border-primary/20 pl-4 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{entry.description}</p>
                                <p className="text-sm text-muted-foreground">{entry.date}</p>
                                <Badge variant={entry.type === "Repair" ? "destructive" : entry.type === "Capital" ? "default" : "secondary"} className="mt-1">
                                  {entry.type}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">${entry.cost.toLocaleString()}</p>
                              </div>
                            </div>
                            {entry.parts.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">Parts:</p>
                                <ul className="text-sm">
                                  {entry.parts.map((part, i) => (
                                    <li key={i} className="text-muted-foreground">• {part}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Capital Investment Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Total Maintenance</p>
                          <p className="text-lg font-bold">
                            ${selectedAsset.maintenance_history
                              .filter(h => h.type === "Maintenance")
                              .reduce((sum, h) => sum + h.cost, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Total Repairs</p>
                          <p className="text-lg font-bold">
                            ${selectedAsset.maintenance_history
                              .filter(h => h.type === "Repair")
                              .reduce((sum, h) => sum + h.cost, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Total Capital</p>
                          <p className="text-lg font-bold">
                            ${selectedAsset.maintenance_history
                              .filter(h => h.type === "Capital")
                              .reduce((sum, h) => sum + h.cost, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="h-32 w-full flex items-center justify-center">
                        <ChartContainer config={{
                          cost: { label: "Cost", color: "hsl(var(--primary))" }
                        }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Maintenance", value: selectedAsset.maintenance_history.filter(h => h.type === "Maintenance").reduce((sum, h) => sum + h.cost, 0) },
                                  { name: "Repairs", value: selectedAsset.maintenance_history.filter(h => h.type === "Repair").reduce((sum, h) => sum + h.cost, 0) },
                                  { name: "Capital", value: selectedAsset.maintenance_history.filter(h => h.type === "Capital").reduce((sum, h) => sum + h.cost, 0) }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={50}
                                dataKey="value"
                              >
                                {[0, 1, 2].map((index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <ChartTooltip 
                                content={<ChartTooltipContent />}
                                formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="cost-breakdown" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Repair Scenario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Immediate Repair Cost</span>
                        <span className="font-bold">${selectedAsset.repair_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Downtime Cost</span>
                        <span className="font-bold">${selectedAsset.estimated_downtime_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Maintenance</span>
                        <span className="font-bold">$8,000 - $12,000</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold">5-Year Total</span>
                          <span className="font-bold text-destructive">
                            ${selectedAsset.projected_costs.repair.reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Replace Scenario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>New Asset Cost</span>
                        <span className="font-bold">${selectedAsset.replacement_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Installation Cost</span>
                        <span className="font-bold">$15,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Maintenance</span>
                        <span className="font-bold">$3,000 - $5,000</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold">5-Year Total</span>
                          <span className="font-bold text-primary">
                            ${selectedAsset.projected_costs.replace.reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="scenario-planning" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Button 
                  variant={selectedScenario === "repair" ? "default" : "outline"}
                  onClick={() => setSelectedScenario("repair")}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Wrench className="h-6 w-6 mb-2" />
                  <div>Repair This Quarter</div>
                </Button>
                <Button 
                  variant={selectedScenario === "replace" ? "default" : "outline"}
                  onClick={() => setSelectedScenario("replace")}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <ArrowRight className="h-6 w-6 mb-2" />
                  <div>Replace Next Quarter</div>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedScenario === "repair" ? "Repair Scenario Impact" : "Replacement Scenario Impact"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Downtime</p>
                      <p className="text-lg font-bold">
                        {selectedScenario === "repair" ? "48 hours" : "5 days"}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Budget Impact</p>
                      <p className="text-lg font-bold">
                        {selectedScenario === "repair" 
                          ? `$${selectedAsset.repair_cost.toLocaleString()}` 
                          : `$${selectedAsset.replacement_cost.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Efficiency Gain</p>
                      <p className="text-lg font-bold">
                        {selectedScenario === "repair" ? "+5%" : "+25%"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="risk-factors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Operational Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Unplanned Downtime</span>
                        <Badge variant="destructive">High</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Cascading Failures</span>
                        <Badge variant="secondary">Medium</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Safety Incidents</span>
                        <Badge variant="secondary">{selectedAsset.safety_risk}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Regulatory Compliance</span>
                        <Badge variant="outline">Low</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Cost Escalation</span>
                        <Badge variant="destructive">High</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Technology Obsolescence</span>
                        <Badge variant="secondary">Medium</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Parts Availability</span>
                        <Badge variant="secondary">Medium</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Energy Efficiency Loss</span>
                        <Badge variant="destructive">High</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};