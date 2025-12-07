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

## Modules & Features

### 1. Prescriptive Maintenance

AI-powered maintenance scheduling and action planning with intelligent prioritization.

| Feature | Description |
|---------|-------------|
| **AI Risk Scoring** | Machine learning-based risk assessment (0-100%) for each asset with color-coded severity indicators |
| **Action Plan Generation** | Automated maintenance action plans with priority levels (Critical, High, Medium, Low) |
| **Parts Inventory Tracking** | Real-time parts availability status with stock levels and reorder alerts |
| **Scenario Analysis** | Cost comparison between immediate action vs. deferral with projected outcomes |
| **Multi-Site Filtering** | Filter assets by site, asset type, risk threshold, and action priority |
| **Summary Statistics** | Dashboard cards showing total assets, critical actions, high-priority items, and parts status |
| **Detailed Action Views** | Drill-down into individual asset action plans with tabs for actions, parts, and scenarios |

### 2. Repair vs Replace Analysis

Financial decision support for asset lifecycle management with AI-driven recommendations.

| Feature | Description |
|---------|-------------|
| **5-Year Cost Projection** | Side-by-side comparison of cumulative repair vs. replacement costs over 5 years |
| **AI Recommendations** | Automated repair/replace recommendations based on condition, costs, and lifecycle |
| **Break-Even Analysis** | Calculates the year when replacement becomes more cost-effective than continued repairs |
| **Health Index Scoring** | Asset condition scoring with visual progress indicators |
| **Maintenance History Log** | Complete maintenance history with costs, dates, and parts used |
| **Capital Investment Summary** | Aggregated view of total maintenance, repair, and capital investment spending |
| **Scenario Planning** | Interactive scenario modeling with budget override options |
| **Risk Factor Assessment** | Evaluation of safety risks, lead times, and criticality levels |

### 3. Performance Benchmarking

Compare your asset performance against industry peers and best practices.

| Feature | Description |
|---------|-------------|
| **KPI Comparison Table** | Side-by-side comparison of your metrics vs. peer median and industry best |
| **Trend Indicators** | Visual trend arrows showing improvement or decline in each metric |
| **Status Badges** | Color-coded status indicators (Above, At, Below median) |
| **Performance by Asset Type** | Breakdown of performance metrics across different equipment categories |
| **Benchmark Group Selection** | Filter by industry sector, time period, and asset type |
| **Improvement Opportunities** | AI-generated recommendations for areas needing attention |
| **Summary Statistics** | Quick overview cards showing above/below median counts |

### 4. Asset Insights (Asset Library)

Comprehensive asset knowledge base with specifications, costs, and lifecycle data.

| Feature | Description |
|---------|-------------|
| **Asset Type Library** | Browsable catalog of asset types with detailed specifications |
| **Equipment Specifications** | Technical specs including capacity, dimensions, weight, efficiency ratings |
| **Energy Cost Analysis** | Annual energy consumption and cost tracking per asset |
| **Lifecycle Cost Modeling** | Typical lifespan, MTBF (Mean Time Between Failures), MTTR (Mean Time To Repair) |
| **Maintenance Schedule Templates** | Recommended maintenance tasks with frequency, time estimates, and costs |
| **New Model Comparison** | Side-by-side comparison with newer models including payback period calculation |
| **Risk Scoring** | Detailed risk scores with common failure mode identification |
| **Safety Requirements** | Required certifications and safety training for each asset type |
| **Multi-Filter Search** | Filter by category, criticality, manufacturer with full-text search |
| **Export Functionality** | Export data to CSV, Excel, or PDF formats |

### 5. AI Copilot

Conversational AI assistant for maintenance professionals with role-based personalization.

| Feature | Description |
|---------|-------------|
| **Role-Based Personas** | Tailored responses for Technicians, Managers, and Planners |
| **Contextual Quick Actions** | Role-specific suggested queries and common tasks |
| **Natural Language Queries** | Ask questions about assets, maintenance, and performance in plain language |
| **Response Type Classification** | Responses categorized as recommendations, analysis, reports, or insights |
| **Troubleshooting Guidance** | Step-by-step troubleshooting assistance with diagnostic questions |
| **Performance Insights** | Quick access to key metrics and trend analysis |
| **Work Order Assistance** | Help with work order creation and prioritization |
| **Chat History** | Persistent conversation history within session |

---

## Shared Components

### FilterBar
Reusable filtering component with support for:
- Text search with debouncing
- Select dropdowns for categorical filters
- Multi-select capabilities
- Filter state persistence

### ExportButton
Data export functionality supporting:
- CSV format for spreadsheet import
- Excel (.xlsx) format with formatting
- PDF format for reports

### SidebarNav
Collapsible navigation with:
- Section grouping
- Icon-based navigation
- Tooltips for collapsed state
- Active route highlighting

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

## License

Proprietary - All rights reserved.
