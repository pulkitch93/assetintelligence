import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Target, Award } from "lucide-react";
import { FilterBar } from "@/components/UI/FilterBar";
import { ExportButton } from "@/components/UI/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample benchmarking data
const mockBenchmarkData = [
  {
    metric: "MTBF (Hours)",
    your_value: 2800,
    peer_median: 3200,
    peer_75th: 3800,
    industry_best: 4500,
    trend: "+5%",
    status: "Below Median"
  },
  {
    metric: "MTTR (Hours)",
    your_value: 4.2,
    peer_median: 5.1,
    peer_75th: 3.8,
    industry_best: 2.1,
    trend: "-12%",
    status: "Above Median"
  },
  {
    metric: "PM Compliance (%)",
    your_value: 87,
    peer_median: 82,
    peer_75th: 91,
    industry_best: 98,
    trend: "+3%",
    status: "Above Median"
  },
  {
    metric: "Unplanned Downtime (%)",
    your_value: 8.5,
    peer_median: 12.2,
    peer_75th: 7.1,
    industry_best: 3.2,
    trend: "-18%",
    status: "Above Median"
  },
  {
    metric: "Maintenance Cost / Asset Value (%)",
    your_value: 6.8,
    peer_median: 7.5,
    peer_75th: 5.9,
    industry_best: 4.2,
    trend: "+2%",
    status: "Above Median"
  }
];

const mockAssetPerformance = [
  {
    asset_type: "Chillers",
    total_assets: 12,
    mtbf_hours: 2800,
    mttr_hours: 4.2,
    pm_compliance: 87,
    downtime_pct: 8.5,
    vs_benchmark: "Above"
  },
  {
    asset_type: "MRI Scanners", 
    total_assets: 4,
    mtbf_hours: 3200,
    mttr_hours: 6.1,
    pm_compliance: 92,
    downtime_pct: 5.2,
    vs_benchmark: "Excellent"
  },
  {
    asset_type: "Pumps",
    total_assets: 24,
    mtbf_hours: 1800,
    mttr_hours: 3.8,
    pm_compliance: 78,
    downtime_pct: 12.1,
    vs_benchmark: "Below"
  }
];

const filterOptions = [
  {
    key: "benchmark_group",
    label: "Benchmark Group",
    type: "select" as const,
    options: ["Healthcare - Large Hospitals", "Healthcare - All", "Manufacturing", "All Industries"]
  },
  {
    key: "time_period",
    label: "Time Period",
    type: "select" as const,
    options: ["Last 3 months", "Last 6 months", "Last 12 months", "Last 24 months"]
  },
  {
    key: "asset_type",
    label: "Asset Type",
    type: "select" as const,
    options: ["All Assets", "Chillers", "MRI Scanners", "Pumps", "Generators"]
  }
];

export const Benchmarking = () => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Above Median": return "success";
      case "Excellent": return "success";
      case "Below Median": return "warning";
      case "Below": return "destructive";
      default: return "secondary";
    }
  };

  const getPerformanceVsTarget = (yourValue: number, peerMedian: number, lowerIsBetter = false) => {
    const diff = lowerIsBetter ? peerMedian - yourValue : yourValue - peerMedian;
    const percentDiff = (diff / peerMedian) * 100;
    return percentDiff;
  };

  return (
    <div className="flex flex-col h-full">
      <FilterBar 
        filters={filterOptions}
        onFiltersChange={setFilters}
        searchPlaceholder="Search metrics..."
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Performance Benchmarking</h1>
            <p className="text-muted-foreground">Compare your maintenance KPIs against industry peers</p>
          </div>
          <ExportButton 
            data={mockBenchmarkData}
            filename="performance-benchmarking"
            formats={['csv', 'excel', 'pdf']}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-success/20 bg-success-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-success flex items-center">
                <Award className="mr-2 h-4 w-4" />
                Above Median
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">3</div>
              <p className="text-xs text-success/70">out of 5 metrics</p>
            </CardContent>
          </Card>
          
          <Card className="border-warning/20 bg-warning-light">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-warning">Below Median</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">1</div>
              <p className="text-xs text-warning/70">needs improvement</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Peer Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Healthcare</div>
              <p className="text-xs text-muted-foreground">Large Hospitals ({'>'} 100 beds)</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-success">Improving</div>
              <p className="text-xs text-muted-foreground">vs last quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Benchmark Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Key Performance Indicators vs Peers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Your Value</TableHead>
                  <TableHead>Peer Median</TableHead>
                  <TableHead>75th Percentile</TableHead>
                  <TableHead>Industry Best</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBenchmarkData.map((metric) => (
                  <TableRow key={metric.metric}>
                    <TableCell className="font-medium">{metric.metric}</TableCell>
                    <TableCell className="font-semibold">{metric.your_value}</TableCell>
                    <TableCell>{metric.peer_median}</TableCell>
                    <TableCell>{metric.peer_75th}</TableCell>
                    <TableCell className="font-medium text-success">{metric.industry_best}</TableCell>
                    <TableCell>
                      <Badge variant={metric.trend.startsWith('+') ? "default" : "secondary"}>
                        {metric.trend}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(metric.status) as any}>
                        {metric.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Asset Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Performance by Asset Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>MTBF (hrs)</TableHead>
                  <TableHead>MTTR (hrs)</TableHead>
                  <TableHead>PM Compliance</TableHead>
                  <TableHead>Downtime %</TableHead>
                  <TableHead>vs Benchmark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAssetPerformance.map((asset) => (
                  <TableRow key={asset.asset_type}>
                    <TableCell className="font-medium">{asset.asset_type}</TableCell>
                    <TableCell>{asset.total_assets}</TableCell>
                    <TableCell>{asset.mtbf_hours.toLocaleString()}</TableCell>
                    <TableCell>{asset.mttr_hours}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={asset.pm_compliance} className="w-16" />
                        <span>{asset.pm_compliance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{asset.downtime_pct}%</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(asset.vs_benchmark) as any}>
                        {asset.vs_benchmark}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Improvement Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Improvement Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-warning pl-4">
                <h4 className="font-medium text-warning">MTBF Improvement Needed</h4>
                <p className="text-sm text-muted-foreground">
                  Your MTBF is 12.5% below peer median. Focus on predictive maintenance for pumps and aging chillers.
                </p>
              </div>
              
              <div className="border-l-4 border-success pl-4">
                <h4 className="font-medium text-success">MTTR Performance Strong</h4>
                <p className="text-sm text-muted-foreground">
                  Your repair times are 18% faster than peers. Consider sharing best practices across sites.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-medium text-primary">PM Compliance Opportunity</h4>
                <p className="text-sm text-muted-foreground">
                  Improving PM compliance by 4% could move you to 75th percentile and reduce unplanned downtime.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};