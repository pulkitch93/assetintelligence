# Data Model Documentation

## Asset Intelligence Platform - Comprehensive Data Models, Algorithms & Formulas

This document provides detailed technical specifications for all feature modules, including data structures, algorithms, calculation formulas, and business logic.

---

## Table of Contents

1. [Prescriptive Maintenance Module](#1-prescriptive-maintenance-module)
2. [Repair vs Replace Analysis Module](#2-repair-vs-replace-analysis-module)
3. [Performance Benchmarking Module](#3-performance-benchmarking-module)
4. [Asset Insights Module](#4-asset-insights-module)
5. [AI Copilot Module](#5-ai-copilot-module)
6. [Shared Data Types & Utilities](#6-shared-data-types--utilities)

---

## 1. Prescriptive Maintenance Module

### 1.1 Purpose
AI-driven maintenance scheduling and action planning with parts inventory management and scenario analysis.

### 1.2 Data Models

#### 1.2.1 Asset Entity
```typescript
interface Asset {
  asset_id: string;              // Unique identifier (e.g., "HVAC-Chiller-001")
  site_id: string;               // Location identifier (e.g., "Hospital-Downtown")
  asset_type: string;            // Equipment category (e.g., "Chiller", "MRI", "Pump")
  age_years: number;             // Asset age in years (decimal)
  condition_score: number;       // Condition rating (1-5 scale)
  risk_score: number;            // AI-calculated risk (0.0 - 1.0)
  failure_probability_30d: number; // 30-day failure probability (0.0 - 1.0)
  last_PM_date: string;          // Last preventive maintenance (ISO date)
  drivers: string[];             // Risk factors (e.g., ["High vibration", "Overdue PM"])
  total_downtime_365d: number;   // Annual downtime in hours
  repair_history_count_365d: number; // Repair count in last 365 days
  prescribed_actions: PrescribedAction[];
}
```

#### 1.2.2 Prescribed Action Entity
```typescript
interface PrescribedAction {
  action: string;                // Action description
  priority: "Critical" | "High" | "Medium" | "Low";
  timeline: string;              // Timeframe (e.g., "Within 3 days", "Today")
  cost: number;                  // Estimated cost in USD
  parts_needed: PartRequirement[];
  estimated_downtime: number;    // Hours of downtime required
}
```

#### 1.2.3 Part Requirement Entity
```typescript
interface PartRequirement {
  part: string;                  // Part name/number
  qty: number;                   // Quantity required
  in_stock: boolean;             // Inventory availability
  stock_qty?: number;            // Current stock quantity (if in_stock)
  lead_time?: string;            // Procurement lead time (if out of stock)
}
```

### 1.3 Algorithms & Formulas

#### 1.3.1 Risk Level Classification
```typescript
function getRiskLevel(score: number): { level: string; color: string } {
  if (score >= 0.7) return { level: "High", color: "destructive" };
  if (score >= 0.4) return { level: "Medium", color: "warning" };
  return { level: "Low", color: "success" };
}
```

**Risk Thresholds:**
| Score Range | Risk Level | Action Required |
|-------------|------------|-----------------|
| 0.70 - 1.00 | High       | Immediate attention |
| 0.40 - 0.69 | Medium     | Schedule within 7 days |
| 0.00 - 0.39 | Low        | Normal PM schedule |

#### 1.3.2 Priority Ordering Algorithm
```typescript
const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };

// Sort actions by priority (highest first)
actions.sort((a, b) => 
  priorityOrder[b.priority] - priorityOrder[a.priority]
);
```

#### 1.3.3 Summary Statistics Calculations
```typescript
// Total critical actions across all assets
const criticalActions = assets.reduce((sum, asset) => 
  sum + asset.prescribed_actions.filter(action => 
    action.priority === "Critical"
  ).length, 0
);

// Parts requiring procurement
const partsOutOfStock = assets.reduce((sum, asset) => 
  sum + asset.prescribed_actions.reduce((partSum, action) => 
    partSum + action.parts_needed.filter(part => !part.in_stock).length, 0
  ), 0
);

// Total cost per asset
const totalCost = asset.prescribed_actions.reduce(
  (sum, action) => sum + action.cost, 0
);
```

#### 1.3.4 Risk Score Calculation (Conceptual AI Model)
```
Risk Score = f(Age Factor, Condition Factor, Maintenance Factor, Usage Factor)

Where:
- Age Factor = (Current Age / Expected Lifespan) × Weight₁
- Condition Factor = (5 - Condition Score) / 4 × Weight₂
- Maintenance Factor = Days Since Last PM / PM Interval × Weight₃
- Usage Factor = Usage Rate / 100 × Weight₄

Typical Weights: W₁=0.25, W₂=0.35, W₃=0.25, W₄=0.15
```

---

## 2. Repair vs Replace Analysis Module

### 2.1 Purpose
Financial decision support for asset lifecycle management with 5-year cost projections and AI-powered recommendations.

### 2.2 Data Models

#### 2.2.1 Asset Analysis Entity
```typescript
interface AssetAnalysis {
  id: string;                    // Asset identifier
  name: string;                  // Asset display name
  age: number;                   // Current age in years
  condition_score: number;       // Health index (0-100%)
  repair_cost: number;           // Current year repair cost
  replacement_cost: number;      // New asset purchase cost
  estimated_downtime_cost: number; // Cost of downtime per incident
  remaining_lifecycle: number;   // Estimated remaining years
  usage_rate: number;            // Utilization percentage
  criticality: "Critical" | "High" | "Medium" | "Low";
  lead_time: string;             // Replacement procurement time
  safety_risk: "High" | "Medium" | "Low";
  maintenance_history: MaintenanceEntry[];
  projected_costs: CostProjection;
}
```

#### 2.2.2 Maintenance History Entity
```typescript
interface MaintenanceEntry {
  date: string;                  // ISO date
  type: "Repair" | "Maintenance" | "Capital";
  cost: number;                  // Cost in USD
  description: string;           // Work performed
  parts: string[];               // Parts used
}
```

#### 2.2.3 Cost Projection Entity
```typescript
interface CostProjection {
  repair: number[];              // 5-year repair cost array [Y1, Y2, Y3, Y4, Y5]
  replace: number[];             // 5-year replacement cost array
}
```

### 2.3 Algorithms & Formulas

#### 2.3.1 Break-Even Analysis
```typescript
function calculateBreakEven(asset: AssetAnalysis): number | null {
  const repairCosts = asset.projected_costs.repair;
  const replaceCosts = asset.projected_costs.replace;
  let cumulativeRepair = 0;
  let cumulativeReplace = 0;
  
  for (let i = 0; i < repairCosts.length; i++) {
    cumulativeRepair += repairCosts[i];
    cumulativeReplace += replaceCosts[i];
    
    // Break-even occurs when cumulative replace cost < cumulative repair cost
    if (cumulativeReplace < cumulativeRepair) {
      return i + 1; // Return year number (1-indexed)
    }
  }
  return null; // No break-even within projection period
}
```

**Break-Even Formula:**
```
Break-Even Year = First year where:
∑(Replace Costs from Y1 to Yn) < ∑(Repair Costs from Y1 to Yn)
```

#### 2.3.2 AI Recommendation Engine
```typescript
function getRecommendation(asset: AssetAnalysis): Recommendation {
  const totalRepairCost = asset.projected_costs.repair.reduce((a, b) => a + b, 0);
  const totalReplaceCost = asset.projected_costs.replace.reduce((a, b) => a + b, 0);
  const breakEven = calculateBreakEven(asset);
  
  // Decision Logic
  if (totalReplaceCost < totalRepairCost || asset.condition_score < 70) {
    return {
      action: "Replace",
      reason: totalReplaceCost < totalRepairCost 
        ? 'Lower 5-year total cost' 
        : 'Poor condition score',
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
}
```

**Decision Matrix:**
| Condition | Total Cost Comparison | Recommendation | Urgency |
|-----------|----------------------|----------------|---------|
| Score < 60 | Any | Replace | Immediate |
| Score 60-69 | Replace < Repair | Replace | Next Quarter |
| Score ≥ 70 | Replace < Repair | Replace | Next Quarter |
| Score ≥ 70 | Repair ≤ Replace | Repair | As Needed |

#### 2.3.3 Health Index Color Coding
```typescript
function healthIndexColor(score: number): string {
  if (score >= 80) return "text-green-600";  // Good
  if (score >= 60) return "text-yellow-600"; // Fair
  return "text-red-600";                      // Poor
}
```

#### 2.3.4 Total Cost of Ownership (TCO) Formula
```
TCO (5-Year) = Initial Cost + ∑(Annual Maintenance) + ∑(Repair Costs) + Downtime Costs

For Repair Option:
TCO_repair = ∑(Projected_Repair_Costs[i]) for i = 1 to 5

For Replace Option:
TCO_replace = Replacement_Cost + ∑(Annual_Maintenance_Costs[i]) for i = 1 to 5
```

---

## 3. Performance Benchmarking Module

### 3.1 Purpose
Compare asset performance against industry peers with KPI tracking and improvement recommendations.

### 3.2 Data Models

#### 3.2.1 Benchmark Metric Entity
```typescript
interface BenchmarkMetric {
  metric: string;                // KPI name (e.g., "MTBF (Hours)")
  your_value: number;            // Your organization's value
  peer_median: number;           // Industry median (50th percentile)
  peer_75th: number;             // Industry 75th percentile
  industry_best: number;         // Best-in-class value
  trend: string;                 // Period-over-period change (e.g., "+5%")
  status: "Above Median" | "Below Median" | "Excellent" | "Below";
}
```

#### 3.2.2 Asset Performance Entity
```typescript
interface AssetPerformance {
  asset_type: string;            // Equipment category
  total_assets: number;          // Count of assets
  mtbf_hours: number;            // Mean Time Between Failures
  mttr_hours: number;            // Mean Time To Repair
  pm_compliance: number;         // PM compliance percentage
  downtime_pct: number;          // Unplanned downtime percentage
  vs_benchmark: "Excellent" | "Above" | "Below";
}
```

### 3.3 Key Performance Indicators (KPIs)

| Metric | Description | Formula | Lower is Better |
|--------|-------------|---------|-----------------|
| MTBF | Mean Time Between Failures | Total Operating Hours / Number of Failures | No |
| MTTR | Mean Time To Repair | Total Repair Time / Number of Repairs | Yes |
| PM Compliance | Preventive Maintenance Adherence | (Completed PMs / Scheduled PMs) × 100 | No |
| Unplanned Downtime | Percentage of unplanned stops | (Unplanned Downtime Hours / Total Hours) × 100 | Yes |
| Maintenance Cost Ratio | Maintenance cost vs asset value | (Annual Maintenance Cost / Asset Value) × 100 | Yes |

### 3.4 Algorithms & Formulas

#### 3.4.1 Performance vs Target Calculation
```typescript
function getPerformanceVsTarget(
  yourValue: number, 
  peerMedian: number, 
  lowerIsBetter: boolean = false
): number {
  const diff = lowerIsBetter 
    ? peerMedian - yourValue 
    : yourValue - peerMedian;
  const percentDiff = (diff / peerMedian) * 100;
  return percentDiff;
}
```

**Interpretation:**
- Positive value = You outperform the median
- Negative value = You underperform the median

#### 3.4.2 Status Classification
```typescript
function getStatusColor(status: string): string {
  switch (status) {
    case "Above Median": return "success";
    case "Excellent": return "success";
    case "Below Median": return "warning";
    case "Below": return "destructive";
    default: return "secondary";
  }
}
```

#### 3.4.3 MTBF Calculation
```
MTBF = Total Operating Time / Number of Failures

Example:
- Operating Hours: 8,760 (1 year)
- Failures: 3
- MTBF = 8,760 / 3 = 2,920 hours
```

#### 3.4.4 MTTR Calculation
```
MTTR = Total Repair Time / Number of Repairs

Example:
- Total Repair Hours: 24
- Number of Repairs: 6
- MTTR = 24 / 6 = 4 hours
```

#### 3.4.5 Overall Equipment Effectiveness (OEE)
```
OEE = Availability × Performance × Quality

Where:
- Availability = (Planned Production Time - Downtime) / Planned Production Time
- Performance = Actual Output / Maximum Possible Output
- Quality = Good Units / Total Units Produced
```

---

## 4. Asset Insights Module

### 4.1 Purpose
Comprehensive asset knowledge base with specifications, lifecycle analysis, energy cost modeling, and maintenance schedules.

### 4.2 Data Models

#### 4.2.1 Asset Type Entity
```typescript
interface AssetType {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  category: string;              // Equipment category
  manufacturer: string;          // OEM name
  model_number: string;          // Model identifier
  serial_number: string;         // Serial number
  capacity: string;              // Rated capacity
  installation_date: string;     // ISO date
  remaining_useful_life_years: number;
  energy_consumption_kwh_annual: number;
  energy_cost_annual: number;
  detailed_risk_score: number;   // 0.0 - 1.0
  technician_name: string;       // Assigned technician
  typical_lifespan_years: number;
  expected_mtbf_hours: number;
  expected_mttr_hours: number;
  common_failure_modes: string[];
  maintenance_frequency_days: number;
  avg_maintenance_cost_annual: number;
  avg_replacement_cost: number;
  new_model_comparison: NewModelComparison;
  criticality: "Critical" | "High" | "Medium" | "Low";
  safety_requirements: string[];
  your_assets_count: number;
  specifications: AssetSpecifications;
  maintenance_schedule: MaintenanceTask[];
}
```

#### 4.2.2 New Model Comparison Entity
```typescript
interface NewModelComparison {
  model: string;                 // New model name
  cost: number;                  // Purchase price
  energy_savings_pct: number;    // Energy efficiency improvement
  annual_energy_cost: number;    // Projected annual energy cost
  payback_years: number;         // Investment payback period
}
```

#### 4.2.3 Asset Specifications Entity
```typescript
interface AssetSpecifications {
  [key: string]: string;         // Dynamic key-value pairs
  // Common properties:
  // - operating_temperature_range
  // - electrical_requirements
  // - weight
  // - dimensions
  // - noise_level
  // - efficiency_rating
}
```

#### 4.2.4 Maintenance Task Entity
```typescript
interface MaintenanceTask {
  task: string;                  // Task description
  frequency: string;             // Schedule interval
  estimated_time: string;        // Duration
  cost: number;                  // Task cost in USD
}
```

### 4.3 Algorithms & Formulas

#### 4.3.1 Risk Score Color Coding
```typescript
function getRiskColor(riskScore: number): string {
  if (riskScore > 0.7) return "destructive"; // High risk
  if (riskScore > 0.4) return "secondary";   // Medium risk
  return "outline";                           // Low risk
}
```

#### 4.3.2 Energy Cost Comparison
```
Annual Savings = Current_Energy_Cost - New_Model_Energy_Cost
Savings Percentage = (Current_Energy_Cost - New_Model_Energy_Cost) / Current_Energy_Cost × 100
```

#### 4.3.3 Payback Period Calculation
```
Payback Period (Years) = (New_Model_Cost - Current_Salvage_Value) / Annual_Savings

Where:
- Annual Savings includes energy savings + reduced maintenance costs
```

#### 4.3.4 Remaining Useful Life (RUL) Estimation
```
RUL = Typical_Lifespan - Current_Age - Degradation_Adjustment

Degradation Adjustment = f(Usage Rate, Environmental Factors, Maintenance Quality)
```

#### 4.3.5 Total Annual Maintenance Cost
```
Total Annual Cost = ∑(Task_Cost × Annual_Frequency) for all tasks

Where Annual_Frequency:
- Daily = 365
- Weekly = 52
- Monthly = 12
- Quarterly = 4
- Semi-annually = 2
- Annually = 1
```

#### 4.3.6 Lifecycle Cost Model
```
Lifecycle Cost = Purchase_Price 
               + ∑(Annual_Maintenance_Cost × Years) 
               + ∑(Major_Repair_Costs) 
               + ∑(Energy_Costs) 
               - Salvage_Value

NPV Calculation:
Lifecycle_Cost_NPV = ∑(Cash_Flow[t] / (1 + r)^t) for t = 0 to n

Where r = discount rate, n = asset lifespan
```

---

## 5. AI Copilot Module

### 5.1 Purpose
Conversational AI assistant for maintenance professionals with role-based personas and contextual recommendations.

### 5.2 Data Models

#### 5.2.1 Chat Message Entity
```typescript
interface ChatMessage {
  id: string;                    // Unique message ID
  role: 'user' | 'assistant';    // Message sender
  content: string;               // Message text (supports markdown)
  timestamp: Date;               // Message timestamp
  type?: 'query' | 'recommendation' | 'analysis' | 'report' | 'insight';
  attachments?: string[];        // Related documents
}
```

#### 5.2.2 Role Persona Entity
```typescript
interface RolePersona {
  color: string;                 // UI color class
  icon: LucideIcon;              // Associated icon
  description: string;           // Role description
}

const rolePersonas = {
  'Technician': {
    color: 'bg-blue-100 text-blue-800',
    icon: Wrench,
    description: 'Field maintenance and troubleshooting'
  },
  'Manager': {
    color: 'bg-green-100 text-green-800',
    icon: Users,
    description: 'Team oversight and resource planning'
  },
  'Planner': {
    color: 'bg-purple-100 text-purple-800',
    icon: BarChart3,
    description: 'Maintenance scheduling and logistics'
  }
};
```

#### 5.2.3 Quick Action Entity
```typescript
interface QuickAction {
  icon: LucideIcon;              // Action icon
  label: string;                 // Display label
  query: string;                 // Pre-filled query template
}
```

### 5.3 Algorithms

#### 5.3.1 Response Type Classification
```typescript
function determineResponseType(query: string): MessageType {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
    return 'recommendation';
  }
  if (lowerQuery.includes('analyze') || lowerQuery.includes('report')) {
    return 'analysis';
  }
  if (lowerQuery.includes('schedule') || lowerQuery.includes('plan')) {
    return 'report';
  }
  return 'insight';
}
```

**Response Type Matrix:**
| Keywords | Response Type | Purpose |
|----------|--------------|---------|
| recommend, suggest | recommendation | Action suggestions |
| analyze, report | analysis | Data analysis |
| schedule, plan | report | Planning output |
| (default) | insight | General information |

#### 5.3.2 Role-Based Response Generation
```typescript
function generateRoleBasedResponse(query: string, role: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Technician-specific responses
  if (role === 'Technician') {
    if (lowerQuery.includes('error') || lowerQuery.includes('fault')) {
      return generateTroubleshootingGuide();
    }
    if (lowerQuery.includes('pm') || lowerQuery.includes('maintenance')) {
      return generatePMSchedule();
    }
  }
  
  // Manager-specific responses
  if (role === 'Manager') {
    return generateTeamDashboard();
  }
  
  // Planner-specific responses
  return generatePlanningAnalysis();
}
```

#### 5.3.3 Quick Actions by Role
```typescript
const quickActionsByRole = {
  'Technician': [
    { label: "Troubleshoot fault", query: "What's causing this error code?" },
    { label: "PM checklist", query: "Show me today's PM tasks for [ASSET]" },
    { label: "Work instructions", query: "Find work instructions for [TASK]" },
    { label: "Safety procedures", query: "What safety steps for [OPERATION]?" }
  ],
  'Manager': [
    { label: "Performance overview", query: "Show team performance metrics this week" },
    { label: "Resource allocation", query: "Which technicians are available today?" },
    { label: "Critical alerts", query: "What are the high-priority issues?" },
    { label: "Cost optimization", query: "Which 5 assets should we replace next year?" }
  ],
  'Planner': [
    { label: "Schedule optimization", query: "When should I schedule downtime for [ASSET]?" },
    { label: "Workload analysis", query: "Show technician availability and workload" },
    { label: "Budget planning", query: "Project maintenance costs for Q4" },
    { label: "Risk analysis", query: "Show critical assets requiring attention" }
  ]
};
```

---

## 6. Shared Data Types & Utilities

### 6.1 Common Enums

```typescript
// Priority Levels
type Priority = "Critical" | "High" | "Medium" | "Low";

// Criticality Levels
type Criticality = "Critical" | "High" | "Medium" | "Low";

// Risk Levels
type RiskLevel = "High" | "Medium" | "Low";

// Maintenance Types
type MaintenanceType = "Repair" | "Maintenance" | "Capital";

// Benchmark Status
type BenchmarkStatus = "Above Median" | "Below Median" | "Excellent" | "Below";
```

### 6.2 Utility Functions

#### 6.2.1 Currency Formatting
```typescript
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}
```

#### 6.2.2 Date Formatting
```typescript
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
```

#### 6.2.3 Time Formatting
```typescript
function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

### 6.3 Filter Configuration Pattern

```typescript
interface FilterOption {
  key: string;                   // Filter field name
  label: string;                 // Display label
  type: "select" | "text" | "date";
  options?: string[];            // Available options (for select type)
}

// Example filter configuration
const filterOptions: FilterOption[] = [
  {
    key: "site_id",
    label: "Site",
    type: "select",
    options: ["Hospital-Downtown", "Hospital-Westside", "Plant-North"]
  },
  {
    key: "asset_type",
    label: "Asset Type",
    type: "select",
    options: ["Chiller", "MRI", "Pump", "Generator"]
  }
];
```

### 6.4 Export Data Formats

| Format | Use Case | File Extension |
|--------|----------|----------------|
| CSV | Spreadsheet import, data analysis | .csv |
| Excel | Business reporting, calculations | .xlsx |
| PDF | Formal reports, documentation | .pdf |
| PNG | Charts, visualizations | .png |

---

## Appendix A: Industry Standard Metrics

### Maintenance KPIs Reference

| Metric | Industry Standard | Best-in-Class | Calculation |
|--------|------------------|---------------|-------------|
| MTBF | 2,000-4,000 hrs | >5,000 hrs | Operating Hours / Failures |
| MTTR | 4-8 hrs | <2 hrs | Repair Time / Repairs |
| PM Compliance | 85% | >95% | Completed / Scheduled × 100 |
| OEE | 65% | >85% | Availability × Performance × Quality |
| Maintenance Cost Ratio | 5-10% | <5% | Maintenance Cost / Asset Value × 100 |

### Asset Criticality Matrix

| Criticality | Production Impact | Safety Impact | Response Time |
|-------------|------------------|---------------|---------------|
| Critical | Full shutdown | Life safety risk | < 1 hour |
| High | Significant reduction | Injury risk | < 4 hours |
| Medium | Minor impact | No immediate risk | < 24 hours |
| Low | No impact | None | Scheduled |

---

## Appendix B: Risk Scoring Model

### Multi-Factor Risk Assessment

```
Overall Risk Score = Σ(Factor_Weight × Factor_Score) / Σ(Factor_Weight)

Factors:
1. Age Factor (25% weight)
   Score = min(1.0, Asset_Age / Expected_Lifespan)

2. Condition Factor (35% weight)
   Score = (5 - Condition_Score) / 4

3. Maintenance Factor (25% weight)
   Score = min(1.0, Days_Since_PM / PM_Interval)

4. Historical Factor (15% weight)
   Score = min(1.0, Failures_Last_Year / 5)
```

### Failure Probability Model

```
P(Failure in 30 days) = 1 - e^(-λt)

Where:
- λ = Failure rate = 1 / MTBF
- t = Time period (30 days = 720 hours)
```

---

*Document Version: 1.0*  
*Last Updated: December 2024*  
*Asset Intelligence Platform*
