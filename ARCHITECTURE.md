# Architecture Documentation

## Overview

The Asset Intelligence Platform is a single-page application (SPA) built with React and TypeScript, following a modular architecture with clear separation of concerns.

---

## Project Structure

```
src/
├── components/
│   ├── Layout/                 # Layout components
│   │   ├── AssetIntelligenceLayout.tsx  # Main app layout with sidebar
│   │   ├── SidebarNav.tsx              # Collapsible navigation
│   │   └── Footer.tsx                  # Global footer
│   ├── UI/                     # Custom UI components
│   │   ├── FilterBar.tsx              # Reusable filter component
│   │   └── ExportButton.tsx           # Data export functionality
│   └── ui/                     # shadcn/ui primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── table.tsx
│       └── ... (40+ components)
├── pages/
│   ├── Index.tsx               # Landing page
│   ├── NotFound.tsx            # 404 page
│   └── AssetIntelligence/      # Feature modules
│       ├── PrescriptiveMaintenance.tsx
│       ├── RepairReplace.tsx
│       ├── Benchmarking.tsx
│       ├── EnhancedAssetInsights.tsx
│       ├── AssetInsights.tsx   # Re-export
│       └── Copilot.tsx
├── hooks/                      # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   └── utils.ts                # Utility functions (cn, etc.)
├── App.tsx                     # Root component with routing
├── main.tsx                    # Application entry point
└── index.css                   # Global styles & design tokens
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      App.tsx                             │   │
│  │  ┌─────────────────────────────────────────────────────┐│   │
│  │  │              React Router (v6)                      ││   │
│  │  │                                                     ││   │
│  │  │   /                    → Index.tsx (Landing)        ││   │
│  │  │   /asset-intelligence  → AssetIntelligenceLayout    ││   │
│  │  │      /predictive-risk  → PrescriptiveMaintenance    ││   │
│  │  │      /repair-replace   → RepairReplace              ││   │
│  │  │      /benchmarking     → Benchmarking               ││   │
│  │  │      /asset-insights   → AssetInsights              ││   │
│  │  │      /copilot          → Copilot                    ││   │
│  │  │   /*                   → NotFound                   ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Providers                             │   │
│  │  • QueryClientProvider (TanStack Query)                 │   │
│  │  • TooltipProvider (Radix UI)                           │   │
│  │  • Toaster (Sonner + shadcn)                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Layout Components

```
┌──────────────────────────────────────────────────────────┐
│                 AssetIntelligenceLayout                   │
│  ┌─────────────┬────────────────────────────────────┐   │
│  │             │                                     │   │
│  │  Sidebar    │        Main Content Area            │   │
│  │  Nav        │        (React Router Outlet)        │   │
│  │             │                                     │   │
│  │  - Modules  │   ┌─────────────────────────────┐  │   │
│  │  - Icons    │   │     FilterBar               │  │   │
│  │  - Tooltips │   ├─────────────────────────────┤  │   │
│  │             │   │     Module Content          │  │   │
│  │             │   │     (Tables, Cards, Charts) │  │   │
│  │             │   └─────────────────────────────┘  │   │
│  └─────────────┴────────────────────────────────────┘   │
│                        Footer                            │
└──────────────────────────────────────────────────────────┘
```

### Module Structure

Each feature module follows a consistent pattern:

```typescript
// Standard module structure
const FeatureModule = () => {
  // 1. State Management
  const [filters, setFilters] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // 2. Derived Data (useMemo)
  const filteredData = useMemo(() => {...}, [filters, data]);
  const summaryStats = useMemo(() => {...}, [filteredData]);

  // 3. Helper Functions
  const formatCurrency = (amount: number) => {...};
  const getStatusColor = (status: string) => {...};

  // 4. Render
  return (
    <div>
      <FilterBar />
      <SummaryCards />
      <DataTable />
      <DetailView />
    </div>
  );
};
```

---

## Data Flow

### Current State (Mock Data)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Mock Data  │ ──▶ │   useMemo    │ ──▶ │  Component  │
│  (const)    │     │  (filtering) │     │   Render    │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Future State (With Backend)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│  Supabase   │ ──▶ │ React Query  │ ──▶ │   useMemo    │ ──▶ │  Component  │
│  Database   │     │   (cache)    │     │  (filtering) │     │   Render    │
└─────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
       ▲                                                             │
       └─────────────────── Mutations ───────────────────────────────┘
```

---

## Design System

### Token-Based Theming

All colors are defined as CSS custom properties in `index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --accent: 210 40% 96%;
  --destructive: 0 84.2% 60.2%;
  /* ... */
}
```

### Component Variants

Using `class-variance-authority` (CVA) for consistent component variants:

```typescript
const buttonVariants = cva(
  "base-styles",
  {
    variants: {
      variant: {
        default: "...",
        destructive: "...",
        outline: "...",
      },
      size: {
        default: "...",
        sm: "...",
        lg: "...",
      },
    },
  }
);
```

---

## Navigation Structure

```typescript
const navigation = [
  {
    name: "Maintenance",
    items: [
      { name: "Prescriptive Maintenance", href: "/asset-intelligence/predictive-risk" },
      { name: "Repair vs Replace", href: "/asset-intelligence/repair-replace" },
    ]
  },
  {
    name: "Analytics",
    items: [
      { name: "Benchmarking", href: "/asset-intelligence/benchmarking" },
      { name: "Asset Insights", href: "/asset-intelligence/asset-insights" },
    ]
  },
  {
    name: "AI Tools",
    items: [
      { name: "AI Copilot", href: "/asset-intelligence/copilot" },
    ]
  }
];
```

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `react-router-dom` | Client-side routing |
| `@tanstack/react-query` | Server state management (prepared for backend) |
| `recharts` | Data visualization |
| `lucide-react` | Icon library |
| `class-variance-authority` | Component variant management |
| `tailwind-merge` | Tailwind class merging |
| `@radix-ui/*` | Accessible UI primitives |
| `sonner` | Toast notifications |

---

## Extension Points

### Adding a New Module

1. Create component in `src/pages/AssetIntelligence/`
2. Add route in `src/App.tsx`
3. Add navigation item in `AssetIntelligenceLayout.tsx`
4. (Optional) Add filter options in `FilterBar`

### Adding Backend Integration

1. Enable Lovable Cloud (Supabase)
2. Create database tables
3. Replace mock data with React Query hooks
4. Add RLS policies for security

### Adding Authentication

1. Enable Lovable Cloud
2. Implement auth flows using Supabase Auth
3. Protect routes with auth guards
4. Add user context provider

---

## Performance Considerations

- **Memoization**: Heavy computations wrapped in `useMemo`
- **Code Splitting**: Each route lazy-loadable (can be added)
- **Component Reuse**: Shared FilterBar, ExportButton across modules
- **CSS**: Tailwind CSS with purging for minimal bundle size

---

## Security Notes

- Currently frontend-only with mock data
- Backend integration should implement:
  - Row Level Security (RLS) in Supabase
  - API key protection via Edge Functions
  - Input validation on all forms
  - Authentication before data access
