import { useState, useMemo } from "react";
import { AlertTriangle, TrendingUp, Clock, Info, Package, ShoppingCart, FileText, Wrench, Calendar } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Enhanced sample data with prescriptive actions
const mockAssets = [
  {
    asset_id: "HVAC-Chiller-001",
    site_id: "Hospital-Downtown",
    asset_type: "Chiller",
    age_years: 8.5,
    condition_score: 2,
    risk_score: 0.89,
    failure_probability_30d: 0.78,
    last_PM_date: "2025-07-10",
    drivers: ["High vibration", "Overdue PM", "Age > 8 years"],
    total_downtime_365d: 48,
    repair_history_count_365d: 3,
    prescribed_actions: [
      {
        action: "Replace vibration sensor",
        priority: "High",
        timeline: "Within 3 days",
        cost: 2500,
        parts_needed: [
          { part: "Vibration Sensor VB-200", qty: 1, in_stock: true, stock_qty: 3 },
          { part: "Mounting Bracket MB-15", qty: 2, in_stock: false, lead_time: "5 days" }
        ],
        estimated_downtime: 4
      },
      {
        action: "Schedule immediate PM inspection",
        priority: "Critical", 
        timeline: "Today",
        cost: 1200,
        parts_needed: [
          { part: "Oil Filter OF-300", qty: 2, in_stock: true, stock_qty: 8 },
          { part: "Gasket Set GS-450", qty: 1, in_stock: true, stock_qty: 2 }
        ],
        estimated_downtime: 6
      },
      {
        action: "Reduce load to 85% until repair",
        priority: "Medium",
        timeline: "Immediate",
        cost: 0,
        parts_needed: [],
        estimated_downtime: 0
      }
    ]
  },
  {
    asset_id: "MRI-Scanner-002", 
    site_id: "Hospital-Westside",
    asset_type: "MRI",
    age_years: 12.2,
    condition_score: 3,
    risk_score: 0.76,
    failure_probability_30d: 0.62,
    last_PM_date: "2025-08-15",
    drivers: ["Temperature anomaly", "Age > 10 years", "Usage spike"],
    total_downtime_365d: 24,
    repair_history_count_365d: 2,
    prescribed_actions: [
      {
        action: "Replace cooling system filter",
        priority: "High",
        timeline: "Within 7 days", 
        cost: 8500,
        parts_needed: [
          { part: "HEPA Filter HF-MRI-200", qty: 1, in_stock: false, lead_time: "10 days" },
          { part: "Temperature Sensor TS-MRI-50", qty: 1, in_stock: true, stock_qty: 1 }
        ],
        estimated_downtime: 8
      }
    ]
  },
  {
    asset_id: "Pump-Water-003",
    site_id: "Plant-North", 
    asset_type: "Pump",
    age_years: 5.1,
    condition_score: 4,
    risk_score: 0.45,
    failure_probability_30d: 0.32,
    last_PM_date: "2025-09-01",
    drivers: ["Normal wear", "Optimal condition"],
    total_downtime_365d: 12,
    repair_history_count_365d: 1,
    prescribed_actions: [
      {
        action: "Continue normal PM schedule",
        priority: "Low",
        timeline: "Next scheduled PM",
        cost: 450,
        parts_needed: [
          { part: "Seal Kit SK-P300", qty: 1, in_stock: true, stock_qty: 5 }
        ],
        estimated_downtime: 2
      }
    ]
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
    key: "risk_threshold",
    label: "Risk Threshold",
    type: "select" as const,
    options: ["High (over 0.7)", "Medium (0.4-0.7)", "Low (under 0.4)"]
  },
  {
    key: "priority",
    label: "Action Priority",
    type: "select" as const,
    options: ["Critical", "High", "Medium", "Low"]
  }
];

const getRiskLevel = (score: number) => {
  if (score >= 0.7) return { level: "High", color: "destructive" as const };
  if (score >= 0.4) return { level: "Medium", color: "warning" as const };
  return { level: "Low", color: "success" as const };
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Critical": return "destructive";
    case "High": return "warning"; 
    case "Medium": return "default";
    case "Low": return "secondary";
    default: return "default";
  }
};

export const PrescriptiveMaintenance = () => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedAsset, setSelectedAsset] = useState<typeof mockAssets[0] | null>(null);
  
  const filteredAssets = useMemo(() => {
    return mockAssets.filter(asset => {
      if (filters.search && !asset.asset_id.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.site_id && asset.site_id !== filters.site_id) {
        return false; 
      }
      if (filters.asset_type && asset.asset_type !== filters.asset_type) {
        return false;
      }
      if (filters.risk_threshold) {
        const { level } = getRiskLevel(asset.risk_score);
        if (filters.risk_threshold.includes(level)) {
          return true;
        }
        return false;
      }
      if (filters.priority) {
        const hasPriority = asset.prescribed_actions.some(action => 
          action.priority === filters.priority
        );
        if (!hasPriority) return false;
      }
      return true;
    });
  }, [filters]);

  const summaryStats = useMemo(() => {
    const totalAssets = filteredAssets.length;
    const criticalActions = filteredAssets.reduce((sum, asset) => 
      sum + asset.prescribed_actions.filter(action => action.priority === "Critical").length, 0
    );
    const highActions = filteredAssets.reduce((sum, asset) => 
      sum + asset.prescribed_actions.filter(action => action.priority === "High").length, 0
    );
    const partsOutOfStock = filteredAssets.reduce((sum, asset) => 
      sum + asset.prescribed_actions.reduce((partSum, action) => 
        partSum + action.parts_needed.filter(part => !part.in_stock).length, 0
      ), 0
    );
    
    return { totalAssets, criticalActions, highActions, partsOutOfStock };
  }, [filteredAssets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full">
      <FilterBar 
        filters={filterOptions}
        onFiltersChange={setFilters}
        searchPlaceholder="Search assets by ID..."
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Prescriptive Maintenance</h1>
            <p className="text-muted-foreground">AI-powered action plans with scheduling and parts management</p>
          </div>
          <ExportButton 
            data={filteredAssets}
            filename="prescriptive-maintenance-actions"
            formats={['csv', 'excel', 'pdf']}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assets Monitored</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalAssets}</div>
            </CardContent>
          </Card>
          
          <Card className="border-destructive/20 bg-destructive-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Critical Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summaryStats.criticalActions}</div>
              <p className="text-xs text-destructive/70">Require immediate attention</p>
            </CardContent>
          </Card>
          
          <Card className="border-warning/20 bg-warning-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-warning">High Priority Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{summaryStats.highActions}</div>
              <p className="text-xs text-warning/70">Within 7 days</p>
            </CardContent>
          </Card>
          
          <Card className="border-accent/20 bg-accent-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary">Parts Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{summaryStats.partsOutOfStock}</div>
              <p className="text-xs text-primary/70">Need procurement</p>
            </CardContent>
          </Card>
        </div>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Prescriptive Action Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Failure Probability</TableHead>
                  <TableHead>Top Actions</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => {
                  const riskInfo = getRiskLevel(asset.risk_score);
                  const totalCost = asset.prescribed_actions.reduce((sum, action) => sum + action.cost, 0);
                  const topAction = asset.prescribed_actions.sort((a, b) => {
                    const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
                    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
                  })[0];
                  
                  return (
                    <TableRow key={asset.asset_id}>
                      <TableCell className="font-medium">{asset.asset_id}</TableCell>
                      <TableCell>{asset.site_id}</TableCell>
                      <TableCell>
                      <Badge variant={riskInfo.color === "warning" ? "secondary" : riskInfo.color === "success" ? "outline" : riskInfo.color}>
                        {riskInfo.level}
                      </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={asset.failure_probability_30d * 100} className="w-16" />
                          <span className="text-sm">{Math.round(asset.failure_probability_30d * 100)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={getPriorityColor(topAction.priority) as any} className="text-xs">
                            {topAction.action}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{topAction.timeline}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(totalCost)}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedAsset(asset)}
                        >
                          View Plan
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detailed Action Plan */}
        {selectedAsset && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Action Plan: {selectedAsset.asset_id}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="actions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="actions">Prescribed Actions</TabsTrigger>
                  <TabsTrigger value="parts">Parts & Inventory</TabsTrigger>
                  <TabsTrigger value="scenario">Scenario Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="actions" className="space-y-4">
                  {selectedAsset.prescribed_actions.map((action, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{action.action}</CardTitle>
                          <Badge variant={getPriorityColor(action.priority) as any}>
                            {action.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {action.timeline}
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {formatCurrency(action.cost)}
                          </div>
                          {action.estimated_downtime > 0 && (
                            <div className="flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              {action.estimated_downtime}h downtime
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      {action.parts_needed.length > 0 && (
                        <CardContent>
                          <h4 className="font-medium mb-2">Required Parts:</h4>
                          <div className="space-y-2">
                            {action.parts_needed.map((part, partIndex) => (
                              <div key={partIndex} className="flex items-center justify-between bg-muted p-2 rounded">
                                <div>
                                  <span className="font-medium">{part.part}</span>
                                  <span className="text-muted-foreground ml-2">Qty: {part.qty}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {part.in_stock ? (
                                      <Badge variant="outline" className="flex items-center">
                                        <Package className="w-3 h-3 mr-1" />
                                        In Stock ({part.stock_qty})
                                      </Badge>
                                  ) : (
                                    <div className="flex space-x-2">
                                      <Badge variant="destructive">
                                        Out of Stock ({part.lead_time})
                                      </Badge>
                                      <Button size="sm" variant="outline" className="text-xs">
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        Order from Grainger
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="parts" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Parts Inventory Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Part Number</TableHead>
                            <TableHead>Quantity Needed</TableHead>
                            <TableHead>Stock Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedAsset.prescribed_actions.flatMap(action => 
                            action.parts_needed.map((part, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{part.part}</TableCell>
                                <TableCell>{part.qty}</TableCell>
                                <TableCell>
                          {part.in_stock ? (
                            <Badge variant="outline">In Stock ({part.stock_qty})</Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                                </TableCell>
                                <TableCell>
                                  {!part.in_stock && (
                                    <div className="flex space-x-2">
                                      <Button size="sm" variant="outline">
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        Grainger
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <FileText className="w-3 h-3 mr-1" />
                                        SAP PO
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="scenario" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Immediate Action (Recommended)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.prescribed_actions.reduce((sum, a) => sum + a.cost, 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Downtime:</span>
                          <span className="font-medium">{selectedAsset.prescribed_actions.reduce((sum, a) => sum + a.estimated_downtime, 0)} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Reduction:</span>
                          <span className="font-medium text-success">-65%</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Delayed Action (1 week)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedAsset.prescribed_actions.reduce((sum, a) => sum + a.cost, 0) * 1.3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Downtime:</span>
                          <span className="font-medium">{selectedAsset.prescribed_actions.reduce((sum, a) => sum + a.estimated_downtime, 0) * 1.5} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Additional Risk:</span>
                          <span className="font-medium text-destructive">+25%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="bg-primary-light border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-primary">AI Recommendation</p>
                          <p className="text-sm text-primary/80">
                            Execute prescribed actions within 3 days to minimize risk and cost. 
                            Schedule maintenance during low production window this weekend.
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