import { useState, useMemo } from "react";
import { BookOpen, Search, FileText, Wrench, AlertTriangle, Zap, DollarSign, Calendar, Home, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterBar } from "@/components/UI/FilterBar";
import { ExportButton } from "@/components/UI/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Enhanced asset library with expanded data and missing details
const mockAssetTypes = [
  {
    id: "chiller-industrial",
    name: "Industrial Chiller",
    category: "HVAC",
    manufacturer: "Carrier",
    model_number: "30XA-080",
    serial_number: "CC21-8834-A",
    capacity: "80 Tons",
    installation_date: "2016-03-15",
    remaining_useful_life_years: 2.5,
    energy_consumption_kwh_annual: 150000,
    energy_cost_annual: 18000,
    detailed_risk_score: 0.78,
    technician_name: "Mike Johnson",
    typical_lifespan_years: 15,
    expected_mtbf_hours: 3500,
    expected_mttr_hours: 4.5,
    common_failure_modes: ["Compressor failure", "Refrigerant leak", "Control system fault"],
    maintenance_frequency_days: 90,
    avg_maintenance_cost_annual: 12000,
    avg_replacement_cost: 125000,
    new_model_comparison: {
      model: "30XA-080 ECO (Solar Hybrid)",
      cost: 145000,
      energy_savings_pct: 35,
      annual_energy_cost: 11700,
      payback_years: 3.2
    },
    criticality: "High",
    safety_requirements: ["Refrigerant handling certification", "Electrical safety training"],
    your_assets_count: 12,
    specifications: {
      operating_temperature_range: "-10°C to 50°C",
      refrigerant_type: "R-410A",
      electrical_requirements: "460V, 3-phase, 60Hz",
      weight: "2,850 lbs",
      dimensions: "72\" x 48\" x 84\"",
      noise_level: "78 dB",
      efficiency_rating: "10.1 EER"
    },
    maintenance_schedule: [
      { task: "Filter replacement", frequency: "Monthly", estimated_time: "1 hour", cost: 250 },
      { task: "Refrigerant level check", frequency: "Quarterly", estimated_time: "2 hours", cost: 500 },
      { task: "Compressor inspection", frequency: "Semi-annually", estimated_time: "4 hours", cost: 1200 },
      { task: "Complete system overhaul", frequency: "Annually", estimated_time: "16 hours", cost: 5500 }
    ]
  },
  {
    id: "mri-scanner",
    name: "MRI Scanner",
    category: "Medical Equipment",
    manufacturer: "Siemens",
    model_number: "MAGNETOM Vida",
    serial_number: "MS45-2019-007",
    capacity: "3T",
    installation_date: "2013-08-20",
    remaining_useful_life_years: 3.8,
    energy_consumption_kwh_annual: 180000,
    energy_cost_annual: 21600,
    detailed_risk_score: 0.62,
    technician_name: "Dr. Sarah Chen",
    typical_lifespan_years: 12,
    expected_mtbf_hours: 4200,
    expected_mttr_hours: 8.2,
    common_failure_modes: ["Magnet quench", "RF system failure", "Gradient coil fault"],
    maintenance_frequency_days: 30,
    avg_maintenance_cost_annual: 85000,
    avg_replacement_cost: 1200000,
    new_model_comparison: {
      model: "MAGNETOM Vida 3T AI-Enhanced",
      cost: 1450000,
      energy_savings_pct: 25,
      annual_energy_cost: 16200,
      payback_years: 8.5
    },
    criticality: "Critical",
    safety_requirements: ["MRI safety training", "Cryogen handling certification"],
    your_assets_count: 4,
    specifications: {
      magnetic_field_strength: "3.0 Tesla",
      bore_diameter: "70 cm", 
      helium_capacity: "1,700 liters",
      gradient_strength: "45 mT/m",
      slew_rate: "200 T/m/s",
      weight: "17,000 lbs",
      dimensions: "94\" x 94\" x 75\"",
      noise_level: "95 dB during scan"
    },
    maintenance_schedule: [
      { task: "Helium level monitoring", frequency: "Weekly", estimated_time: "0.5 hours", cost: 150 },
      { task: "Cryogenic system check", frequency: "Monthly", estimated_time: "3 hours", cost: 2500 },
      { task: "RF calibration", frequency: "Quarterly", estimated_time: "8 hours", cost: 8000 },
      { task: "Magnet shimming", frequency: "Annually", estimated_time: "24 hours", cost: 25000 }
    ]
  },
  {
    id: "centrifugal-pump",
    name: "Centrifugal Pump",
    category: "Fluid Systems",
    manufacturer: "Grundfos",
    model_number: "CR-64-3-2",
    serial_number: "GP2024-451",
    capacity: "500 GPM",
    installation_date: "2020-01-15",
    remaining_useful_life_years: 7.5,
    energy_consumption_kwh_annual: 45000,
    energy_cost_annual: 5400,
    detailed_risk_score: 0.25,
    technician_name: "Carlos Rodriguez",
    typical_lifespan_years: 12,
    expected_mtbf_hours: 8760,
    expected_mttr_hours: 3.0,
    common_failure_modes: ["Bearing wear", "Seal failure", "Impeller erosion"],
    maintenance_frequency_days: 60,
    avg_maintenance_cost_annual: 3500,
    avg_replacement_cost: 28000,
    new_model_comparison: {
      model: "CR-64-3-2 IE5 (High Efficiency)",
      cost: 32000,
      energy_savings_pct: 20,
      annual_energy_cost: 4320,
      payback_years: 3.7
    },
    criticality: "Medium",
    safety_requirements: ["Lockout/tagout training", "Confined space entry"],
    your_assets_count: 8,
    specifications: {
      flow_rate: "500 GPM at 150 ft head",
      motor_power: "15 HP",
      operating_pressure: "175 PSI max",
      temperature_range: "32°F to 200°F",
      material: "Cast iron with stainless steel impeller",
      weight: "485 lbs",
      dimensions: "36\" x 24\" x 28\"",
      efficiency: "78%"
    },
    maintenance_schedule: [
      { task: "Bearing lubrication", frequency: "Monthly", estimated_time: "1 hour", cost: 85 },
      { task: "Vibration analysis", frequency: "Quarterly", estimated_time: "2 hours", cost: 400 },
      { task: "Seal inspection", frequency: "Semi-annually", estimated_time: "3 hours", cost: 650 },
      { task: "Impeller replacement", frequency: "Every 3 years", estimated_time: "8 hours", cost: 2800 }
    ]
  },
  {
    id: "emergency-generator",
    name: "Emergency Generator",
    category: "Power Systems",
    manufacturer: "Caterpillar",
    model_number: "C18-650",
    serial_number: "CAT2021-789",
    capacity: "650 kW",
    installation_date: "2019-06-10",
    remaining_useful_life_years: 8.2,
    energy_consumption_kwh_annual: 12000,
    energy_cost_annual: 1800,
    detailed_risk_score: 0.35,
    technician_name: "Robert Kim",
    typical_lifespan_years: 15,
    expected_mtbf_hours: 2200,
    expected_mttr_hours: 6.5,
    common_failure_modes: ["Engine failure", "Alternator fault", "Fuel system issues"],
    maintenance_frequency_days: 90,
    avg_maintenance_cost_annual: 8500,
    avg_replacement_cost: 185000,
    new_model_comparison: {
      model: "C18-650 Tier 4 (Low Emissions)",
      cost: 210000,
      energy_savings_pct: 15,
      annual_energy_cost: 1530,
      payback_years: 12.5
    },
    criticality: "Critical",
    safety_requirements: ["Diesel engine maintenance certification", "Electrical safety training"],
    your_assets_count: 3,
    specifications: {
      rated_power: "650 kW / 812.5 kVA",
      fuel_type: "Diesel #2",
      fuel_consumption: "38.2 gal/hr at full load",
      starting_method: "Electric start with backup air start",
      alternator: "3-phase, 480V, 60Hz",
      weight: "14,800 lbs",
      dimensions: "168\" x 64\" x 96\"",
      noise_level: "85 dB at 7 meters"
    },
    maintenance_schedule: [
      { task: "Weekly test run", frequency: "Weekly", estimated_time: "1 hour", cost: 120 },
      { task: "Oil and filter change", frequency: "Monthly", estimated_time: "2 hours", cost: 450 },
      { task: "Load bank test", frequency: "Quarterly", estimated_time: "4 hours", cost: 1200 },
      { task: "Major engine service", frequency: "Annually", estimated_time: "16 hours", cost: 4500 }
    ]
  },
  {
    id: "air-compressor",
    name: "Rotary Screw Air Compressor",
    category: "Pneumatic Systems",
    manufacturer: "Atlas Copco",
    model_number: "GA-55-VSD",
    serial_number: "AC2022-156",
    capacity: "55 kW",
    installation_date: "2022-03-20",
    remaining_useful_life_years: 9.8,
    energy_consumption_kwh_annual: 320000,
    energy_cost_annual: 38400,
    detailed_risk_score: 0.15,
    technician_name: "Jennifer Walsh",
    typical_lifespan_years: 12,
    expected_mtbf_hours: 4500,
    expected_mttr_hours: 4.0,
    common_failure_modes: ["Screw element wear", "Oil separator failure", "Control system fault"],
    maintenance_frequency_days: 45,
    avg_maintenance_cost_annual: 5200,
    avg_replacement_cost: 85000,
    new_model_comparison: {
      model: "GA-55-VSD+ (Next Generation)",
      cost: 95000,
      energy_savings_pct: 12,
      annual_energy_cost: 33792,
      payback_years: 2.2
    },
    criticality: "High",
    safety_requirements: ["Compressed air safety training", "OSHA 10-hour certification"],
    your_assets_count: 6,
    specifications: {
      free_air_delivery: "272 CFM at 125 PSI",
      motor_power: "75 HP",
      operating_pressure: "125-175 PSI",
      oil_capacity: "19 gallons",
      air_tank: "240 gallon receiver",
      weight: "3,200 lbs",
      dimensions: "84\" x 48\" x 72\"",
      noise_level: "68 dB"
    },
    maintenance_schedule: [
      { task: "Air filter replacement", frequency: "Monthly", estimated_time: "0.5 hours", cost: 180 },
      { task: "Oil and filter service", frequency: "Every 2 months", estimated_time: "2 hours", cost: 620 },
      { task: "Separator element replacement", frequency: "Annually", estimated_time: "4 hours", cost: 1800 },
      { task: "Screw element overhaul", frequency: "Every 8 years", estimated_time: "24 hours", cost: 15000 }
    ]
  },
  {
    id: "boiler-steam",
    name: "Steam Boiler",
    category: "Heating Systems",
    manufacturer: "Cleaver-Brooks",
    model_number: "CB-200-150",
    serial_number: "CB2020-892",
    capacity: "200 HP",
    installation_date: "2018-11-05",
    remaining_useful_life_years: 6.5,
    energy_consumption_kwh_annual: 25000,
    energy_cost_annual: 3200,
    detailed_risk_score: 0.45,
    technician_name: "David Martinez",
    typical_lifespan_years: 18,
    expected_mtbf_hours: 3200,
    expected_mttr_hours: 8.0,
    common_failure_modes: ["Tube failure", "Burner issues", "Water treatment problems"],
    maintenance_frequency_days: 30,
    avg_maintenance_cost_annual: 12000,
    avg_replacement_cost: 220000,
    new_model_comparison: {
      model: "CB-200-150 High Efficiency Condensing",
      cost: 265000,
      energy_savings_pct: 18,
      annual_energy_cost: 2624,
      payback_years: 7.8
    },
    criticality: "Critical",
    safety_requirements: ["Boiler operator license", "Steam system safety training"],
    your_assets_count: 2,
    specifications: {
      steam_output: "6,900 lbs/hr at 150 PSI",
      fuel_type: "Natural gas",
      efficiency: "83% thermal efficiency",
      water_capacity: "850 gallons",
      steam_pressure_max: "150 PSI",
      weight: "8,500 lbs",
      dimensions: "144\" x 72\" x 96\"",
      noise_level: "82 dB"
    },
    maintenance_schedule: [
      { task: "Water quality testing", frequency: "Daily", estimated_time: "0.5 hours", cost: 50 },
      { task: "Burner inspection", frequency: "Monthly", estimated_time: "3 hours", cost: 800 },
      { task: "Tube cleaning", frequency: "Quarterly", estimated_time: "8 hours", cost: 2500 },
      { task: "Major overhaul", frequency: "Every 3 years", estimated_time: "40 hours", cost: 18000 }
    ]
  }
];

const filterOptions = [
  {
    key: "category",
    label: "Category",
    type: "select" as const,
    options: ["HVAC", "Medical Equipment", "Fluid Systems", "Power Systems", "Pneumatic Systems", "Heating Systems"]
  },
  {
    key: "criticality",
    label: "Criticality",
    type: "select" as const,
    options: ["Critical", "High", "Medium", "Low"]
  },
  {
    key: "manufacturer",
    label: "Manufacturer",
    type: "select" as const,
    options: ["Carrier", "Siemens", "Grundfos", "Caterpillar", "Atlas Copco", "Cleaver-Brooks"]
  }
];

export const AssetInsights = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedAssetType, setSelectedAssetType] = useState<typeof mockAssetTypes[0] | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const filteredAssetTypes = useMemo(() => {
    return mockAssetTypes.filter(asset => {
      if (filters.search && !asset.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category && asset.category !== filters.category) {
        return false;
      }
      if (filters.criticality && asset.criticality !== filters.criticality) {
        return false;
      }
      if (filters.manufacturer && asset.manufacturer !== filters.manufacturer) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore > 0.7) return "destructive";
    if (riskScore > 0.4) return "secondary";
    return "outline";
  };

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
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Asset Insights</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col h-[calc(100vh-64px)]">
        <FilterBar 
          filters={filterOptions}
          onFiltersChange={setFilters}
          searchPlaceholder="Search asset types..."
        />
        
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Asset Insights</h1>
              <p className="text-muted-foreground">Cost comparisons, lifecycle analysis, and comprehensive asset specifications</p>
            </div>
            <ExportButton 
              data={filteredAssetTypes}
              filename="asset-insights"
              formats={['csv', 'excel', 'pdf']}
            />
          </div>

          {!selectedAssetType ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssetTypes.map((assetType) => (
                <Card key={assetType.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedAssetType(assetType)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{assetType.name}</CardTitle>
                      <Badge variant="outline">{assetType.category}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Your Assets:</span>
                        <span className="font-medium">{assetType.your_assets_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Technician:</span>
                        <span className="font-medium">{assetType.technician_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Energy Cost:</span>
                        <span className="font-medium">{formatCurrency(assetType.energy_cost_annual)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Score:</span>
                        <Badge variant={getRiskColor(assetType.detailed_risk_score)}>
                          {Math.round(assetType.detailed_risk_score * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{selectedAssetType.name}</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedAssetType(null)}>
                    Back to Library
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="cost-comparison">Cost Comparison</TabsTrigger>
                    <TabsTrigger value="energy-analysis">Energy Analysis</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Manufacturer</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold">{selectedAssetType.manufacturer}</div>
                          <p className="text-sm text-muted-foreground">{selectedAssetType.model_number}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Serial Number</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold">{selectedAssetType.serial_number}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Capacity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold">{selectedAssetType.capacity}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Installation Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold">{formatDate(selectedAssetType.installation_date)}</div>
                          <p className="text-sm text-muted-foreground">
                            {Math.round((new Date().getTime() - new Date(selectedAssetType.installation_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Additional Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Useful Life</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold text-primary">{selectedAssetType.remaining_useful_life_years} yrs</div>
                          <p className="text-sm text-muted-foreground">Estimated remaining</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Energy Consumption</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold">{selectedAssetType.energy_consumption_kwh_annual.toLocaleString()} kWh</div>
                          <p className="text-sm text-muted-foreground">Annual usage</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Energy Cost/Year</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-bold text-warning">{formatCurrency(selectedAssetType.energy_cost_annual)}</div>
                          <p className="text-sm text-muted-foreground">Operating cost</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Detailed Risk Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <div className={`text-lg font-bold ${getRiskColor(selectedAssetType.detailed_risk_score) === 'destructive' ? 'text-destructive' : getRiskColor(selectedAssetType.detailed_risk_score) === 'secondary' ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {Math.round(selectedAssetType.detailed_risk_score * 100)}%
                            </div>
                            <Badge variant={getRiskColor(selectedAssetType.detailed_risk_score)}>
                              {selectedAssetType.detailed_risk_score > 0.7 ? 'High Risk' : selectedAssetType.detailed_risk_score > 0.4 ? 'Medium Risk' : 'Low Risk'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Technician Assignment */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="mr-2 h-5 w-5" />
                          Assigned Personnel
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Primary Technician: {selectedAssetType.technician_name}</p>
                            <p className="text-sm text-muted-foreground">Specialized in {selectedAssetType.category} maintenance</p>
                          </div>
                          <Badge variant="outline">Certified</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="specifications" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Technical Specifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(selectedAssetType.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                              <span className="capitalize font-medium">{key.replace(/_/g, ' ')}:</span>
                              <span className="text-muted-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="cost-comparison" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Current Asset</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Model:</span>
                            <span className="font-medium">{selectedAssetType.model_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Energy Cost:</span>
                            <span className="font-medium">{formatCurrency(selectedAssetType.energy_cost_annual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Maintenance:</span>
                            <span className="font-medium">{formatCurrency(selectedAssetType.avg_maintenance_cost_annual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Energy Consumption:</span>
                            <span className="font-medium">{selectedAssetType.energy_consumption_kwh_annual.toLocaleString()} kWh</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-bold">Total Annual Operating:</span>
                            <span className="font-bold">
                              {formatCurrency(selectedAssetType.energy_cost_annual + selectedAssetType.avg_maintenance_cost_annual)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-primary/20 bg-primary-light">
                        <CardHeader>
                          <CardTitle className="text-primary">New Model Alternative</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Model:</span>
                            <span className="font-medium">{selectedAssetType.new_model_comparison.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Purchase Cost:</span>
                            <span className="font-medium">{formatCurrency(selectedAssetType.new_model_comparison.cost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Energy Cost:</span>
                            <span className="font-medium text-success">
                              {formatCurrency(selectedAssetType.new_model_comparison.annual_energy_cost)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Energy Consumption:</span>
                            <span className="font-medium text-success">
                              {Math.round(selectedAssetType.energy_consumption_kwh_annual * (1 - selectedAssetType.new_model_comparison.energy_savings_pct / 100)).toLocaleString()} kWh
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Energy Savings:</span>
                            <Badge variant="outline" className="text-success">
                              {selectedAssetType.new_model_comparison.energy_savings_pct}% reduction
                            </Badge>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-bold">Payback Period:</span>
                            <span className="font-bold text-primary">
                              {selectedAssetType.new_model_comparison.payback_years} years
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="energy-analysis" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Current Annual Consumption</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-warning">{selectedAssetType.energy_consumption_kwh_annual.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">kWh per year</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Annual Energy Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-destructive">{formatCurrency(selectedAssetType.energy_cost_annual)}</div>
                          <p className="text-xs text-muted-foreground">Current operating cost</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Potential Savings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-success">
                            {formatCurrency(selectedAssetType.energy_cost_annual - selectedAssetType.new_model_comparison.annual_energy_cost)}
                          </div>
                          <p className="text-xs text-muted-foreground">With new model</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Energy Efficiency Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Energy Cost per kWh:</span>
                            <span className="font-medium">${(selectedAssetType.energy_cost_annual / selectedAssetType.energy_consumption_kwh_annual).toFixed(3)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Daily Energy Usage:</span>
                            <span className="font-medium">{Math.round(selectedAssetType.energy_consumption_kwh_annual / 365)} kWh</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Monthly Energy Cost:</span>
                            <span className="font-medium">{formatCurrency(selectedAssetType.energy_cost_annual / 12)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Carbon Footprint (est.):</span>
                            <span className="font-medium">{Math.round(selectedAssetType.energy_consumption_kwh_annual * 0.4)} lbs CO₂/year</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="maintenance" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Maintenance Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task</TableHead>
                              <TableHead>Frequency</TableHead>
                              <TableHead>Est. Time</TableHead>
                              <TableHead>Cost</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedAssetType.maintenance_schedule.map((task, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{task.task}</TableCell>
                                <TableCell>{task.frequency}</TableCell>
                                <TableCell>{task.estimated_time}</TableCell>
                                <TableCell>{formatCurrency(task.cost)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Maintenance Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Annual Maintenance Cost:</span>
                            <span className="font-medium">{formatCurrency(selectedAssetType.avg_maintenance_cost_annual)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maintenance Frequency:</span>
                            <span className="font-medium">Every {selectedAssetType.maintenance_frequency_days} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected MTBF:</span>
                            <span className="font-medium">{selectedAssetType.expected_mtbf_hours} hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected MTTR:</span>
                            <span className="font-medium">{selectedAssetType.expected_mttr_hours} hours</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Common Failure Modes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedAssetType.common_failure_modes.map((failure, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-warning" />
                                <span className="text-sm">{failure}</span>
                              </div>
                             ))}
                           </div>
                         </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};