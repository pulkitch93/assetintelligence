# Asset Intelligence Platform

An AI-powered maintenance management platform providing predictive analytics, lifecycle optimization, and intelligent asset management for industrial equipment.

**Live Demo**: [https://assetintelligence.lovable.app](https://assetintelligence.lovable.app)

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Data Visualization**: Recharts
- **State Management**: TanStack React Query
- **Routing**: React Router v6

---

## Table of Contents

1. [Module Overview](#module-overview)
2. [Prescriptive Maintenance](#1-prescriptive-maintenance)
3. [Repair vs Replace Analysis](#2-repair-vs-replace-analysis)
4. [Performance Benchmarking](#3-performance-benchmarking)
5. [Asset Insights](#4-asset-insights-asset-library)
6. [AI Copilot](#5-ai-copilot)
7. [Shared Components](#shared-components)
8. [Getting Started](#getting-started)
9. [Deployment](#deployment)

---

## Module Overview

| Module | Purpose | Key Features |
|--------|---------|--------------|
| Prescriptive Maintenance | AI-driven maintenance scheduling | Risk scoring, action plans, parts tracking |
| Repair vs Replace | Lifecycle cost analysis | 5-year projections, break-even analysis |
| Benchmarking | Performance comparison | KPI tracking, peer comparison |
| Asset Insights | Asset knowledge base | Specifications, lifecycle data, costs |
| AI Copilot | Natural language assistant | Role-based responses, quick actions |

---

## 1. Prescriptive Maintenance

**Location:** `src/pages/AssetIntelligence/PrescriptiveMaintenance.tsx`

### Purpose
Provides AI-powered maintenance scheduling and action planning with intelligent prioritization to prevent equipment failures and optimize maintenance resources.

### How It Was Built

The module is built as a single React functional component using the following patterns:

```typescript
// State Management
const [filters, setFilters] = useState<Record<string, any>>({});
const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

// Derived Data with Memoization
const filteredAssets = useMemo(() => {
  return mockAssets.filter(asset => {
    // Apply filter conditions
    if (filters.site && asset.site !== filters.site) return false;
    if (filters.riskThreshold && asset.riskScore < thresholdValue) return false;
    return true;
  });
}, [filters]);

const summaryStats = useMemo(() => ({
  totalAssets: filteredAssets.length,
  criticalActions: filteredAssets.filter(a => a.priority === 'critical').length,
  // ... more aggregations
}), [filteredAssets]);
```

### Features

| Feature | Implementation | Description |
|---------|----------------|-------------|
| **AI Risk Scoring** | `getRiskLevel()` helper function | Categorizes assets into High (≥70%), Medium (40-69%), Low (<40%) risk with color-coded badges |
| **Action Plan Generation** | Tabbed interface with `Tabs` component | Displays prescribed actions, parts needed, and scenario analysis for each asset |
| **Parts Inventory Tracking** | Table with stock status indicators | Shows part availability, reorder alerts, and lead times |
| **Scenario Analysis** | Side-by-side cost comparison cards | Compares immediate action vs. deferral outcomes |
| **Multi-Site Filtering** | `FilterBar` component integration | Filters by site, asset type, risk threshold, action priority |
| **Summary Statistics** | `Card` components with computed stats | Real-time counts of total assets, critical actions, parts status |

### Data Flow
```
mockAssets (constant) 
    → filters (useState) 
    → filteredAssets (useMemo) 
    → summaryStats (useMemo) 
    → UI Components
```

### Key Helper Functions
```typescript
const getRiskLevel = (score: number) => {
  if (score >= 0.7) return { level: "High", color: "destructive" };
  if (score >= 0.4) return { level: "Medium", color: "secondary" };
  return { level: "Low", color: "outline" };
};

const getPriorityColor = (priority: string) => {
  const colors = { critical: 'destructive', high: 'default', medium: 'secondary', low: 'outline' };
  return colors[priority] || 'outline';
};
```

---

## 2. Repair vs Replace Analysis

**Location:** `src/pages/AssetIntelligence/RepairReplace.tsx`

### Purpose
Provides financial decision support for asset lifecycle management with AI-driven recommendations based on 5-year cost projections and break-even analysis.

### How It Was Built

The module implements a multi-panel dashboard with interactive asset selection:

```typescript
// Asset selection state
const [selectedAsset, setSelectedAsset] = useState(mockAssets[0]);
const [selectedScenario, setSelectedScenario] = useState<"repair" | "replace">("repair");

// Break-even calculation
const calculateBreakEven = (asset: Asset) => {
  let cumulativeRepair = 0;
  let cumulativeReplace = 0;
  
  for (let i = 0; i < asset.projected_costs.repair.length; i++) {
    cumulativeRepair += asset.projected_costs.repair[i];
    cumulativeReplace += asset.projected_costs.replace[i];
    
    if (cumulativeReplace < cumulativeRepair) {
      return i + 1; // Break-even year
    }
  }
  return null;
};

// AI Recommendation engine
const getRecommendation = (asset: Asset) => {
  const totalRepairCost = asset.projected_costs.repair.reduce((a, b) => a + b, 0);
  const totalReplaceCost = asset.projected_costs.replace.reduce((a, b) => a + b, 0);
  
  if (totalReplaceCost < totalRepairCost || asset.condition_score < 70) {
    return {
      action: "Replace",
      reason: `Lower 5-year total cost`,
      savings: Math.abs(totalRepairCost - totalReplaceCost),
      urgency: asset.condition_score < 60 ? "Immediate" : "Next Quarter"
    };
  }
  
  return { action: "Repair", reason: "More cost-effective", ... };
};
```

### Features

| Feature | Implementation | Description |
|---------|----------------|-------------|
| **5-Year Cost Projection** | Grid-based table with cost arrays | Side-by-side repair vs. replace costs per year |
| **AI Recommendations** | `getRecommendation()` function | Automated analysis based on costs, condition, lifecycle |
| **Break-Even Analysis** | `calculateBreakEven()` function | Identifies the year replacement becomes cost-effective |
| **Health Index Scoring** | `Progress` component with conditional colors | Visual asset condition indicator (green/yellow/red) |
| **Maintenance History Log** | `ScrollArea` with timeline layout | Complete history with costs, dates, parts used |
| **Capital Investment Summary** | Aggregated pie chart data | Total spending by maintenance type |
| **Scenario Planning** | Interactive tabs for different scenarios | Budget override and timeline adjustments |
| **Risk Factor Assessment** | Badge-based risk indicators | Safety, lead time, and criticality ratings |

### Data Structure
```typescript
interface Asset {
  id: string;
  name: string;
  condition_score: number; // 0-100
  repair_cost: number;
  replacement_cost: number;
  remaining_lifecycle: number;
  projected_costs: {
    repair: number[];   // 5-year array
    replace: number[];  // 5-year array
  };
  maintenance_history: MaintenanceEntry[];
}
```

---

## 3. Performance Benchmarking

**Location:** `src/pages/AssetIntelligence/Benchmarking.tsx`

### Purpose
Enables comparison of organizational asset performance against industry peers and best practices, identifying areas for improvement.

### How It Was Built

The module uses a table-driven approach with computed performance indicators:

```typescript
// Benchmark comparison data
const mockBenchmarkData = [
  {
    metric: "MTBF (Mean Time Between Failures)",
    yourValue: 3200,
    peerMedian: 3500,
    industryBest: 4200,
    unit: "hours",
    lowerIsBetter: false,
    trend: "up"
  },
  // ... more metrics
];

// Performance calculation
const getPerformanceVsTarget = (yourValue: number, peerMedian: number, lowerIsBetter = false) => {
  const diff = ((yourValue - peerMedian) / peerMedian) * 100;
  
  if (lowerIsBetter) {
    return { percentage: -diff, status: diff < 0 ? 'above' : 'below' };
  }
  return { percentage: diff, status: diff > 0 ? 'above' : 'below' };
};

// Status badge color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'above': return 'default';    // Green - good
    case 'at': return 'secondary';      // Yellow - neutral
    case 'below': return 'destructive'; // Red - needs attention
  }
};
```

### Features

| Feature | Implementation | Description |
|---------|----------------|-------------|
| **KPI Comparison Table** | `Table` component with computed cells | Your value vs. peer median vs. industry best |
| **Trend Indicators** | Arrow icons based on `trend` property | Visual improvement/decline indicators |
| **Status Badges** | `Badge` with `getStatusColor()` | Color-coded Above/At/Below median status |
| **Performance by Asset Type** | Secondary data table | Breakdown by equipment category |
| **Benchmark Group Selection** | `FilterBar` integration | Industry sector, time period, asset type filters |
| **Improvement Opportunities** | Alert cards with recommendations | AI-generated suggestions for underperforming areas |
| **Summary Statistics** | Stat cards at top | Quick counts of above/below median metrics |

### Key Metrics Tracked
- MTBF (Mean Time Between Failures)
- MTTR (Mean Time To Repair)
- Overall Equipment Effectiveness (OEE)
- Planned Maintenance Percentage
- Maintenance Cost per Asset
- Energy Efficiency
- First-Time Fix Rate
- Spare Parts Availability

---

## 4. Asset Insights (Asset Library)

**Location:** `src/pages/AssetIntelligence/EnhancedAssetInsights.tsx`

### Purpose
Provides a comprehensive asset knowledge base with detailed specifications, lifecycle data, maintenance schedules, and cost analysis for all equipment types.

### How It Was Built

The module implements a master-detail pattern with rich asset type data:

```typescript
// Rich asset type data structure
const mockAssetTypes = [
  {
    id: "chiller-industrial",
    name: "Industrial Chiller",
    category: "HVAC",
    manufacturer: "Carrier",
    model_number: "30XA-080",
    typical_lifespan_years: 15,
    expected_mtbf_hours: 3500,
    expected_mttr_hours: 4.5,
    common_failure_modes: ["Compressor failure", "Refrigerant leak"],
    
    specifications: {
      operating_temperature_range: "-10°C to 50°C",
      electrical_requirements: "460V, 3-phase, 60Hz",
      weight: "2,850 lbs",
      efficiency_rating: "10.1 EER"
    },
    
    maintenance_schedule: [
      { task: "Filter replacement", frequency: "Monthly", estimated_time: "1 hour", cost: 250 },
      { task: "Compressor inspection", frequency: "Semi-annually", estimated_time: "4 hours", cost: 1200 }
    ],
    
    new_model_comparison: {
      model: "30XA-080 ECO (Solar Hybrid)",
      cost: 145000,
      energy_savings_pct: 35,
      payback_years: 3.2
    }
  }
];

// Filtering logic
const filteredAssetTypes = useMemo(() => {
  return mockAssetTypes.filter(asset => {
    if (filters.search && !asset.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category && asset.category !== filters.category) return false;
    if (filters.criticality && asset.criticality !== filters.criticality) return false;
    if (filters.manufacturer && asset.manufacturer !== filters.manufacturer) return false;
    return true;
  });
}, [filters]);
```

### Features

| Feature | Implementation | Description |
|---------|----------------|-------------|
| **Asset Type Library** | Card grid with click-to-expand | Browsable catalog with summary information |
| **Equipment Specifications** | Tabbed detail view | Technical specs, dimensions, ratings |
| **Energy Cost Analysis** | Computed fields | Annual consumption and cost per asset |
| **Lifecycle Cost Modeling** | Aggregated maintenance data | MTBF, MTTR, typical lifespan |
| **Maintenance Schedule Templates** | Table with frequency data | Recommended tasks, time estimates, costs |
| **New Model Comparison** | Side-by-side comparison panel | Newer model benefits and payback period |
| **Risk Scoring** | Risk indicator with failure modes | Common failure patterns |
| **Safety Requirements** | List of certifications | Required training for each asset type |
| **Multi-Filter Search** | `FilterBar` with 3 dropdowns | Category, criticality, manufacturer |
| **Export Functionality** | `ExportButton` integration | CSV, Excel, PDF export |

### Detail View Tabs
1. **Overview** - Key specs, risk score, energy costs
2. **Specifications** - Full technical specifications
3. **Maintenance** - Scheduled maintenance tasks
4. **Comparison** - New model upgrade analysis

---

## 5. AI Copilot

**Location:** `src/pages/AssetIntelligence/Copilot.tsx`

### Purpose
Provides a conversational AI assistant for maintenance professionals with role-based personalization, offering natural language queries and contextual insights.

### How It Was Built

The module implements a chat interface with role-based response generation:

```typescript
// Role persona definitions
const rolePersonas = {
  technician: {
    color: "blue",
    icon: Wrench,
    description: "Field technician focus: troubleshooting, repairs, parts"
  },
  manager: {
    color: "purple", 
    icon: BarChart,
    description: "Management focus: costs, KPIs, team performance"
  },
  planner: {
    color: "green",
    icon: Calendar,
    description: "Planner focus: scheduling, resources, optimization"
  }
};

// Quick actions per role
const quickActionsByRole = {
  technician: [
    { label: "Troubleshoot", query: "Help me diagnose a pump vibration issue" },
    { label: "Parts Lookup", query: "What parts do I need for chiller repair?" }
  ],
  manager: [
    { label: "Cost Report", query: "Show me this month's maintenance costs" },
    { label: "Team Performance", query: "How is my maintenance team performing?" }
  ],
  planner: [
    { label: "Schedule", query: "What maintenance is scheduled this week?" },
    { label: "Optimize", query: "How can I optimize PM scheduling?" }
  ]
};

// Response generation (simulated)
const generateRoleBasedResponse = (query: string, role: string) => {
  // Simulated AI response based on role and query
  const responses = {
    technician: {
      troubleshoot: "Based on the symptoms, here are diagnostic steps...",
      parts: "The following parts are typically needed..."
    },
    // ... more role-specific responses
  };
  
  return responses[role][determineIntent(query)];
};

// Message type classification
const determineResponseType = (content: string) => {
  if (content.includes("recommend")) return "recommendation";
  if (content.includes("analysis")) return "analysis";
  if (content.includes("report")) return "report";
  return "insight";
};
```

### Features

| Feature | Implementation | Description |
|---------|----------------|-------------|
| **Role-Based Personas** | `rolePersonas` object with UI config | Tailored responses for Technician/Manager/Planner |
| **Contextual Quick Actions** | `quickActionsByRole` mapped buttons | Role-specific suggested queries |
| **Natural Language Queries** | Text input with simulated processing | Plain language question handling |
| **Response Type Classification** | `determineResponseType()` function | Badges for recommendation/analysis/report/insight |
| **Troubleshooting Guidance** | Conditional response content | Step-by-step diagnostic flows |
| **Performance Insights** | Pre-built insight templates | Key metrics and trend summaries |
| **Work Order Assistance** | Form-filling suggestions | Help with work order creation |
| **Chat History** | `messages` state array | Persistent conversation within session |

### Chat Interface Structure
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'query' | 'recommendation' | 'analysis' | 'report' | 'insight';
  attachments?: string[];
}

// State management
const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
const [inputValue, setInputValue] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [selectedPersona, setSelectedPersona] = useState<string>("technician");
```

---

## Shared Components

### FilterBar

**Location:** `src/components/UI/FilterBar.tsx`

Reusable filtering component providing consistent filtering UX across all modules.

```typescript
interface FilterOption {
  key: string;           // Unique identifier
  label: string;         // Display label  
  type: 'select' | 'range' | 'text';
  options?: string[];    // For select type
  defaultValue?: string;
}

// Usage in modules
const filterOptions = [
  { key: "site", label: "Site", type: "select", options: ["Site A", "Site B"] },
  { key: "criticality", label: "Criticality", type: "select", options: ["Critical", "High", "Medium"] }
];

<FilterBar
  filters={filterOptions}
  onFiltersChange={(filters) => setFilters(filters)}
  searchPlaceholder="Search assets..."
/>
```

**Features:**
- Full-text search with real-time filtering
- Popover-based filter panel
- Active filter badges with remove buttons
- Clear all filters functionality
- Filter count indicator

### ExportButton

**Location:** `src/components/UI/ExportButton.tsx`

Data export functionality supporting multiple formats.

```typescript
<ExportButton
  data={filteredAssets}
  filename="asset-report"
  formats={['csv', 'excel', 'pdf']}
/>
```

**Features:**
- CSV export with automatic header detection
- Excel export (placeholder for xlsx integration)
- PDF report generation (placeholder for jspdf)
- PNG screenshot capture
- Loading states and toast notifications

### SidebarNav

**Location:** `src/components/Layout/SidebarNav.tsx`

Collapsible navigation with section grouping.

**Features:**
- Icon-based navigation
- Tooltips for collapsed state
- Active route highlighting
- Section headers
- Smooth collapse/expand animation

---

## Getting Started

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Deployment

Deploy via Lovable by clicking **Share → Publish** in the editor.

For custom domains, navigate to **Project → Settings → Domains**.

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture diagrams and component relationships
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Backend schemas, Edge Functions, and utility APIs

---

## License

Proprietary - All rights reserved.
