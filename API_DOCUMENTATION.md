# API Documentation

This document outlines the database schemas, Edge Function endpoints, utility functions, storage modules, and integration patterns for the Asset Intelligence Platform backend.

---

## Table of Contents

1. [Database Schema](#database-schema)
2. [Edge Functions](#edge-functions)
3. [Authentication](#authentication)
4. [Row Level Security](#row-level-security)
5. [API Endpoints](#api-endpoints)
6. [Storage Modules](#storage-modules)
7. [Utility Functions](#utility-functions)
8. [Frontend Components API](#frontend-components-api)

---

## Database Schema

### Core Tables

#### `profiles`
User profile information linked to Supabase Auth.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

#### `organizations`
Multi-tenant organization support.

```sql
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
```

#### `user_roles`
Role-based access control (RBAC).

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'technician', 'viewer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, organization_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

---

### Asset Management Tables

#### `sites`
Physical locations where assets are installed.

```sql
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  coordinates POINT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sites_organization ON public.sites(organization_id);
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
```

#### `asset_types`
Master catalog of asset type definitions.

```sql
CREATE TABLE public.asset_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  manufacturer TEXT,
  model_number TEXT,
  typical_lifespan_years INTEGER,
  expected_mtbf_hours INTEGER,
  expected_mttr_hours DECIMAL(5,2),
  common_failure_modes TEXT[],
  specifications JSONB DEFAULT '{}',
  safety_requirements TEXT[],
  maintenance_schedule JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asset_types_category ON public.asset_types(category);
ALTER TABLE public.asset_types ENABLE ROW LEVEL SECURITY;
```

#### `assets`
Individual asset instances.

```sql
CREATE TYPE public.asset_criticality AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.asset_status AS ENUM ('operational', 'degraded', 'failed', 'maintenance', 'decommissioned');

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  asset_type_id UUID REFERENCES public.asset_types(id) NOT NULL,
  asset_tag TEXT NOT NULL,
  serial_number TEXT,
  name TEXT NOT NULL,
  description TEXT,
  installation_date DATE,
  warranty_expiry DATE,
  criticality asset_criticality DEFAULT 'medium',
  status asset_status DEFAULT 'operational',
  condition_score INTEGER CHECK (condition_score >= 0 AND condition_score <= 100),
  risk_score DECIMAL(3,2) CHECK (risk_score >= 0 AND risk_score <= 1),
  remaining_useful_life_years DECIMAL(4,1),
  location_details JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  assigned_technician_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, asset_tag)
);

CREATE INDEX idx_assets_organization ON public.assets(organization_id);
CREATE INDEX idx_assets_site ON public.assets(site_id);
CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_assets_criticality ON public.assets(criticality);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
```

---

### Maintenance Tables

#### `maintenance_actions`
Prescribed and scheduled maintenance actions.

```sql
CREATE TYPE public.action_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.action_status AS ENUM ('pending', 'scheduled', 'in_progress', 'completed', 'deferred', 'cancelled');

CREATE TABLE public.maintenance_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority action_priority DEFAULT 'medium',
  status action_status DEFAULT 'pending',
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  scheduled_date DATE,
  completed_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES public.profiles(id),
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence DECIMAL(3,2),
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_actions_asset ON public.maintenance_actions(asset_id);
CREATE INDEX idx_maintenance_actions_status ON public.maintenance_actions(status);
CREATE INDEX idx_maintenance_actions_priority ON public.maintenance_actions(priority);
ALTER TABLE public.maintenance_actions ENABLE ROW LEVEL SECURITY;
```

#### `maintenance_history`
Historical maintenance records.

```sql
CREATE TYPE public.maintenance_type AS ENUM ('preventive', 'corrective', 'predictive', 'condition_based', 'emergency');

CREATE TABLE public.maintenance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  action_id UUID REFERENCES public.maintenance_actions(id),
  maintenance_type maintenance_type NOT NULL,
  description TEXT NOT NULL,
  cost DECIMAL(12,2),
  labor_hours DECIMAL(5,2),
  downtime_hours DECIMAL(5,2),
  performed_by UUID REFERENCES public.profiles(id),
  performed_at TIMESTAMPTZ NOT NULL,
  parts_used JSONB DEFAULT '[]',
  notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_history_asset ON public.maintenance_history(asset_id);
CREATE INDEX idx_maintenance_history_date ON public.maintenance_history(performed_at);
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;
```

#### `parts_inventory`
Spare parts and inventory tracking.

```sql
CREATE TABLE public.parts_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  part_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_cost DECIMAL(10,2),
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 0,
  lead_time_days INTEGER,
  supplier TEXT,
  location TEXT,
  compatible_asset_types UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, part_number)
);

CREATE INDEX idx_parts_organization ON public.parts_inventory(organization_id);
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;
```

---

### Analytics Tables

#### `benchmarks`
Industry benchmark data for comparison.

```sql
CREATE TABLE public.benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  category TEXT NOT NULL,
  industry TEXT,
  peer_median DECIMAL(12,4),
  industry_best DECIMAL(12,4),
  unit TEXT,
  lower_is_better BOOLEAN DEFAULT FALSE,
  effective_date DATE,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_benchmarks_category ON public.benchmarks(category);
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
```

#### `performance_metrics`
Tracked KPIs per organization.

```sql
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12,4) NOT NULL,
  unit TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  asset_type_id UUID REFERENCES public.asset_types(id),
  site_id UUID REFERENCES public.sites(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_org ON public.performance_metrics(organization_id);
CREATE INDEX idx_performance_metrics_period ON public.performance_metrics(period_start, period_end);
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
```

#### `repair_replace_analyses`
Stored repair vs replace analysis results.

```sql
CREATE TABLE public.repair_replace_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  analysis_date TIMESTAMPTZ DEFAULT NOW(),
  recommendation TEXT CHECK (recommendation IN ('repair', 'replace')),
  confidence_score DECIMAL(3,2),
  repair_cost_5yr DECIMAL(12,2),
  replace_cost_5yr DECIMAL(12,2),
  break_even_year INTEGER,
  factors JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rr_analyses_asset ON public.repair_replace_analyses(asset_id);
ALTER TABLE public.repair_replace_analyses ENABLE ROW LEVEL SECURITY;
```

---

### AI Copilot Tables

#### `copilot_conversations`
Chat history for AI Copilot.

```sql
CREATE TABLE public.copilot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  persona TEXT CHECK (persona IN ('technician', 'manager', 'planner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_copilot_conversations_user ON public.copilot_conversations(user_id);
ALTER TABLE public.copilot_conversations ENABLE ROW LEVEL SECURITY;
```

#### `copilot_messages`
Individual messages in conversations.

```sql
CREATE TABLE public.copilot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.copilot_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('query', 'recommendation', 'analysis', 'report', 'insight')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_copilot_messages_conversation ON public.copilot_messages(conversation_id);
ALTER TABLE public.copilot_messages ENABLE ROW LEVEL SECURITY;
```

---

## Edge Functions

### AI Copilot

#### `ai-copilot`
Process natural language queries and generate AI responses.

**Endpoint:** `POST /functions/v1/ai-copilot`

**Request:**
```json
{
  "message": "What are the top 5 assets at risk of failure?",
  "conversation_id": "uuid",
  "persona": "manager",
  "context": {
    "organization_id": "uuid",
    "site_id": "uuid"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "role": "assistant",
  "content": "Based on current risk scores, here are the top 5 assets...",
  "message_type": "analysis",
  "metadata": {
    "assets_referenced": ["uuid1", "uuid2"],
    "confidence": 0.92
  }
}
```

---

### Prescriptive Maintenance

#### `generate-maintenance-plan`
AI-powered maintenance plan generation.

**Endpoint:** `POST /functions/v1/generate-maintenance-plan`

**Request:**
```json
{
  "asset_id": "uuid",
  "include_parts": true,
  "budget_constraint": 50000,
  "time_horizon_months": 12
}
```

**Response:**
```json
{
  "asset_id": "uuid",
  "actions": [
    {
      "title": "Compressor seal replacement",
      "priority": "high",
      "estimated_cost": 8500,
      "estimated_hours": 4,
      "recommended_date": "2024-03-15",
      "parts_required": ["Seal Kit SK-401"],
      "ai_reasoning": "Vibration analysis indicates seal degradation..."
    }
  ],
  "total_estimated_cost": 45000,
  "risk_reduction": 0.35
}
```

---

### Risk Analysis

#### `calculate-risk-scores`
Batch calculate risk scores for assets.

**Endpoint:** `POST /functions/v1/calculate-risk-scores`

**Request:**
```json
{
  "asset_ids": ["uuid1", "uuid2"],
  "factors": ["age", "condition", "maintenance_history", "criticality"]
}
```

**Response:**
```json
{
  "results": [
    {
      "asset_id": "uuid1",
      "risk_score": 0.78,
      "factors": {
        "age_factor": 0.8,
        "condition_factor": 0.7,
        "history_factor": 0.85
      },
      "trend": "increasing"
    }
  ]
}
```

---

### Repair vs Replace

#### `analyze-repair-replace`
Generate repair vs replace recommendation.

**Endpoint:** `POST /functions/v1/analyze-repair-replace`

**Request:**
```json
{
  "asset_id": "uuid",
  "projection_years": 5,
  "include_downtime_costs": true
}
```

**Response:**
```json
{
  "asset_id": "uuid",
  "recommendation": "replace",
  "confidence": 0.87,
  "repair_projection": {
    "year_1": 45000,
    "year_2": 52000,
    "year_3": 58000,
    "year_4": 65000,
    "year_5": 72000,
    "total": 292000
  },
  "replace_projection": {
    "year_1": 180000,
    "year_2": 8000,
    "year_3": 8500,
    "year_4": 9000,
    "year_5": 9500,
    "total": 215000
  },
  "break_even_year": 2,
  "reasoning": "Replacement becomes cost-effective in Year 2..."
}
```

---

### Benchmarking

#### `fetch-benchmarks`
Get industry benchmarks for comparison.

**Endpoint:** `POST /functions/v1/fetch-benchmarks`

**Request:**
```json
{
  "organization_id": "uuid",
  "metrics": ["mtbf", "mttr", "uptime", "maintenance_cost_ratio"],
  "industry": "manufacturing",
  "period": "2024-Q1"
}
```

**Response:**
```json
{
  "benchmarks": [
    {
      "metric": "mtbf",
      "your_value": 3200,
      "peer_median": 3500,
      "industry_best": 4200,
      "percentile": 45,
      "trend": "improving"
    }
  ]
}
```

---

### Export

#### `export-data`
Generate export files in various formats.

**Endpoint:** `POST /functions/v1/export-data`

**Request:**
```json
{
  "type": "assets",
  "format": "excel",
  "filters": {
    "site_id": "uuid",
    "status": ["operational", "degraded"]
  },
  "columns": ["name", "asset_tag", "status", "risk_score"]
}
```

**Response:**
```json
{
  "download_url": "https://storage.supabase.co/...",
  "expires_at": "2024-03-15T12:00:00Z",
  "row_count": 150
}
```

---

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: {
      full_name: 'John Doe'
    }
  }
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});
```

### Session Management
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    }
  );

  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

---

## Row Level Security

### Helper Function
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = _user_id
$$;
```

### Example Policies

#### Assets Table
```sql
-- Users can view assets in their organization
CREATE POLICY "Users can view organization assets"
ON public.assets
FOR SELECT
TO authenticated
USING (
  organization_id = public.get_user_organization_id(auth.uid())
);

-- Managers and admins can insert assets
CREATE POLICY "Managers can insert assets"
ON public.assets
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = public.get_user_organization_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);

-- Managers and admins can update assets
CREATE POLICY "Managers can update assets"
ON public.assets
FOR UPDATE
TO authenticated
USING (
  organization_id = public.get_user_organization_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);
```

#### Maintenance Actions
```sql
-- Technicians can view and update assigned actions
CREATE POLICY "Technicians can view assigned actions"
ON public.maintenance_actions
FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.assets a
    WHERE a.id = asset_id
    AND a.organization_id = public.get_user_organization_id(auth.uid())
  )
);
```

---

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/functions/v1/ai-copilot` | POST | JWT | AI chat responses |
| `/functions/v1/generate-maintenance-plan` | POST | JWT | Generate maintenance plans |
| `/functions/v1/calculate-risk-scores` | POST | JWT | Calculate asset risk scores |
| `/functions/v1/analyze-repair-replace` | POST | JWT | Repair vs replace analysis |
| `/functions/v1/fetch-benchmarks` | POST | JWT | Get industry benchmarks |
| `/functions/v1/export-data` | POST | JWT | Export data to files |

---

## Storage Modules

### File Storage Buckets

#### `attachments`
Maintenance history attachments and documents.

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false);

-- RLS Policy: Users can upload to their organization folder
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = public.get_user_organization_id(auth.uid())::text
);

-- RLS Policy: Users can view their organization's attachments
CREATE POLICY "Users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = public.get_user_organization_id(auth.uid())::text
);
```

#### `exports`
Generated export files (CSV, Excel, PDF).

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false);

-- Files auto-expire after 24 hours
```

#### `avatars`
User profile pictures.

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Storage Methods

#### Upload File
```typescript
const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string } | { error: Error }> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) return { error };

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: publicUrl };
};

// Usage
const result = await uploadFile(
  'attachments',
  `${organizationId}/${assetId}/${file.name}`,
  file
);
```

#### Download File
```typescript
const downloadFile = async (
  bucket: string,
  path: string
): Promise<Blob | null> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    console.error('Download error:', error);
    return null;
  }

  return data;
};
```

#### Delete File
```typescript
const deleteFile = async (
  bucket: string,
  paths: string[]
): Promise<boolean> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  return !error;
};
```

#### List Files
```typescript
const listFiles = async (
  bucket: string,
  folder: string
): Promise<FileObject[]> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  return data || [];
};
```

#### Get Signed URL (Private Files)
```typescript
const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  return data?.signedUrl || null;
};
```

---

## Utility Functions

### `cn` - Class Name Merger
Combines Tailwind CSS classes with proper precedence handling.

**Location:** `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage Examples
cn("px-4 py-2", "bg-primary");
// => "px-4 py-2 bg-primary"

cn("px-4", "px-8");
// => "px-8" (later class wins)

cn("text-red-500", isError && "text-destructive");
// => "text-destructive" (conditional)

cn(
  "base-class",
  variant === "primary" && "bg-primary",
  variant === "secondary" && "bg-secondary"
);
// => "base-class bg-primary" or "base-class bg-secondary"
```

### Currency Formatter
Format monetary values consistently.

```typescript
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  minimumFractionDigits: number = 0
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
  }).format(amount);
};

// Usage
formatCurrency(45000);        // => "$45,000"
formatCurrency(1234.56, 'USD', 2); // => "$1,234.56"
```

### Date Formatter
Format dates for display.

```typescript
export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString(
    'en-US',
    options || defaultOptions
  );
};

// Usage
formatDate('2024-03-15');  // => "Mar 15, 2024"
```

### Risk Score Helpers

```typescript
export const getRiskLevel = (score: number): {
  level: string;
  color: string;
  variant: 'destructive' | 'secondary' | 'outline';
} => {
  if (score >= 0.7) {
    return { level: 'High', color: 'text-destructive', variant: 'destructive' };
  }
  if (score >= 0.4) {
    return { level: 'Medium', color: 'text-warning', variant: 'secondary' };
  }
  return { level: 'Low', color: 'text-success', variant: 'outline' };
};

// Usage
const { level, color, variant } = getRiskLevel(0.78);
// => { level: 'High', color: 'text-destructive', variant: 'destructive' }
```

### Priority Color Mapper

```typescript
export const getPriorityColor = (
  priority: string
): 'destructive' | 'default' | 'secondary' | 'outline' => {
  const colors: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    critical: 'destructive',
    high: 'default',
    medium: 'secondary',
    low: 'outline'
  };
  return colors[priority.toLowerCase()] || 'outline';
};
```

### Percentage Calculator

```typescript
export const calculatePercentage = (
  value: number,
  baseline: number,
  lowerIsBetter: boolean = false
): { percentage: number; status: 'above' | 'below' | 'at' } => {
  const diff = ((value - baseline) / baseline) * 100;
  
  let status: 'above' | 'below' | 'at';
  if (Math.abs(diff) < 5) {
    status = 'at';
  } else if (lowerIsBetter) {
    status = diff < 0 ? 'above' : 'below';
  } else {
    status = diff > 0 ? 'above' : 'below';
  }
  
  return { percentage: Math.abs(diff), status };
};
```

---

## Frontend Components API

### FilterBar Component

**Location:** `src/components/UI/FilterBar.tsx`

#### Props Interface
```typescript
interface FilterOption {
  key: string;           // Unique identifier for the filter
  label: string;         // Display label
  type: 'select' | 'range' | 'text';
  options?: string[];    // For select type
  defaultValue?: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  onFiltersChange: (filters: Record<string, any>) => void;
  searchPlaceholder?: string;
}
```

#### Usage Example
```tsx
const filterOptions: FilterOption[] = [
  {
    key: "site",
    label: "Site",
    type: "select",
    options: ["Site A", "Site B", "Site C"]
  },
  {
    key: "criticality",
    label: "Criticality",
    type: "select",
    options: ["Critical", "High", "Medium", "Low"]
  }
];

<FilterBar
  filters={filterOptions}
  onFiltersChange={(filters) => setActiveFilters(filters)}
  searchPlaceholder="Search assets..."
/>
```

#### Methods
| Method | Description |
|--------|-------------|
| `handleFilterChange(key, value)` | Updates a single filter value |
| `removeFilter(key)` | Removes a specific filter |
| `clearAllFilters()` | Resets all filters to empty state |
| `handleSearchChange(value)` | Updates search term |

---

### ExportButton Component

**Location:** `src/components/UI/ExportButton.tsx`

#### Props Interface
```typescript
type ExportFormat = 'csv' | 'excel' | 'pdf' | 'png';

interface ExportButtonProps {
  data: any[];           // Data to export
  filename: string;      // Base filename (without extension)
  formats?: ExportFormat[]; // Available export formats
  className?: string;    // Additional CSS classes
}
```

#### Usage Example
```tsx
<ExportButton
  data={filteredAssets}
  filename="asset-report"
  formats={['csv', 'excel', 'pdf']}
/>
```

#### Export Methods
| Method | Description |
|--------|-------------|
| `exportToCSV(data, filename)` | Converts data to CSV and triggers download |
| `exportToExcel(data, filename)` | Generates Excel file (requires xlsx library) |
| `exportToPDF(data, filename)` | Generates PDF report (requires jspdf library) |
| `exportToPNG(filename)` | Captures current view as PNG image |
| `downloadFile(content, filename, contentType)` | Generic file download helper |

---

## Environment Variables

Required secrets for Edge Functions:

| Secret Name | Description |
|-------------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for AI Copilot |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| AI Copilot | 60 requests/minute |
| Risk Calculation | 100 requests/minute |
| Export | 10 requests/minute |
| General | 1000 requests/minute |

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid or expired authentication token |
| `AUTH_002` | Insufficient permissions for operation |
| `ASSET_001` | Asset not found |
| `ASSET_002` | Invalid asset data |
| `MAINT_001` | Maintenance action not found |
| `MAINT_002` | Cannot modify completed action |
| `AI_001` | AI service unavailable |
| `AI_002` | Token limit exceeded |
| `EXPORT_001` | Export generation failed |
| `EXPORT_002` | File too large for export |
