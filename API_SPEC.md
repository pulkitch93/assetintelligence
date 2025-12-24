# API Specification

## Asset Intelligence Platform - REST API Reference

**Version:** 1.0.0  
**Base URL:** `https://{project-ref}.supabase.co`  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Common Headers](#2-common-headers)
3. [Error Handling](#3-error-handling)
4. [Rate Limiting](#4-rate-limiting)
5. [API Endpoints](#5-api-endpoints)
   - [Authentication Endpoints](#51-authentication-endpoints)
   - [Assets API](#52-assets-api)
   - [Maintenance API](#53-maintenance-api)
   - [Prescriptive Maintenance API](#54-prescriptive-maintenance-api)
   - [Repair vs Replace API](#55-repair-vs-replace-api)
   - [Benchmarking API](#56-benchmarking-api)
   - [AI Copilot API](#57-ai-copilot-api)
   - [Export API](#58-export-api)
6. [Webhooks](#6-webhooks)
7. [SDK Usage](#7-sdk-usage)

---

## 1. Authentication

### 1.1 Authentication Methods

| Method | Use Case | Header |
|--------|----------|--------|
| Bearer Token | User sessions | `Authorization: Bearer <access_token>` |
| API Key | Service-to-service | `apikey: <anon_key>` |
| Service Role | Server-side operations | `Authorization: Bearer <service_role_key>` |

### 1.2 Token Structure

```typescript
interface JWTPayload {
  aud: string;                // Audience (e.g., "authenticated")
  exp: number;                // Expiration timestamp
  iat: number;                // Issued at timestamp
  iss: string;                // Issuer URL
  sub: string;                // User ID (UUID)
  email: string;              // User email
  phone: string;              // User phone (optional)
  app_metadata: {
    provider: string;         // Auth provider
    providers: string[];
  };
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  role: string;               // Supabase role
  session_id: string;         // Session identifier
}
```

### 1.3 Session Management

**Token Refresh:**
- Access tokens expire after 1 hour (configurable)
- Refresh tokens are valid for 7 days (configurable)
- Use automatic token refresh via Supabase client

```typescript
// Automatic session refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    // New access token available
  }
});
```

---

## 2. Common Headers

### 2.1 Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes* | Bearer token for authenticated requests |
| `apikey` | Yes | Supabase anonymous key |
| `Content-Type` | Yes | `application/json` |
| `Accept` | No | `application/json` (default) |
| `Prefer` | No | Response preferences (see below) |
| `Range` | No | Pagination range (e.g., `0-24`) |

### 2.2 Prefer Header Options

| Value | Description |
|-------|-------------|
| `return=minimal` | Return no body on success |
| `return=representation` | Return the created/updated record |
| `count=exact` | Include exact count in response |
| `count=estimated` | Include estimated count (faster) |
| `resolution=merge-duplicates` | Upsert behavior |

### 2.3 Response Headers

| Header | Description |
|--------|-------------|
| `Content-Range` | Pagination info (e.g., `0-24/100`) |
| `X-Total-Count` | Total record count (with `count` prefer) |
| `X-RateLimit-Remaining` | Requests remaining |
| `X-RateLimit-Reset` | Rate limit reset timestamp |

---

## 3. Error Handling

### 3.1 Error Response Schema

```typescript
interface APIError {
  code: string;               // Error code (e.g., "PGRST301")
  message: string;            // Human-readable message
  details: string | null;     // Additional details
  hint: string | null;        // Suggested resolution
}
```

### 3.2 HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Successful GET/PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Invalid request body |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | RLS policy violation |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Unique constraint violation |
| `422` | Unprocessable | Validation error |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Internal error |

### 3.3 Error Code Reference

| Code | Description | Resolution |
|------|-------------|------------|
| `PGRST000` | Connection error | Check database connection |
| `PGRST100` | Parsing error | Fix request syntax |
| `PGRST200` | Schema cache error | Refresh schema cache |
| `PGRST301` | JWT expired | Refresh token |
| `PGRST302` | Invalid JWT | Re-authenticate |
| `42501` | RLS violation | Check user permissions |
| `23505` | Unique violation | Record already exists |
| `23503` | Foreign key violation | Referenced record missing |

### 3.4 Error Response Examples

**Authentication Error:**
```json
{
  "code": "PGRST301",
  "message": "JWT expired",
  "details": null,
  "hint": "Refresh your access token"
}
```

**Validation Error:**
```json
{
  "code": "23514",
  "message": "new row violates check constraint \"assets_condition_score_check\"",
  "details": "Failing row contains (uuid, ..., 150, ...).",
  "hint": "condition_score must be between 0 and 100"
}
```

---

## 4. Rate Limiting

### 4.1 Default Limits

| Tier | Requests/Minute | Burst Limit |
|------|-----------------|-------------|
| Anonymous | 100 | 20 |
| Authenticated | 500 | 50 |
| Service Role | 1000 | 100 |

### 4.2 Rate Limit Response

```json
{
  "code": "429",
  "message": "Rate limit exceeded",
  "details": "Too many requests",
  "hint": "Retry after 60 seconds"
}
```

---

## 5. API Endpoints

---

### 5.1 Authentication Endpoints

#### POST /auth/v1/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "options": {
    "emailRedirectTo": "https://app.example.com/",
    "data": {
      "full_name": "John Doe"
    }
  }
}
```

**Response (201):**
```json
{
  "user": {
    "id": "d0e8c69e-f8b1-4c3e-9a5d-7f6b8c9d0e1f",
    "email": "user@example.com",
    "email_confirmed_at": null,
    "created_at": "2024-01-15T10:30:00Z",
    "user_metadata": {
      "full_name": "John Doe"
    }
  },
  "session": null
}
```

---

#### POST /auth/v1/token?grant_type=password
Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1705315800,
  "refresh_token": "v1.refresh-token-string",
  "user": {
    "id": "d0e8c69e-f8b1-4c3e-9a5d-7f6b8c9d0e1f",
    "email": "user@example.com",
    "email_confirmed_at": "2024-01-15T10:35:00Z"
  }
}
```

---

#### POST /auth/v1/token?grant_type=refresh_token
Refresh an expired access token.

**Request:**
```json
{
  "refresh_token": "v1.refresh-token-string"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1705319400,
  "refresh_token": "v1.new-refresh-token-string",
  "user": { ... }
}
```

---

#### POST /auth/v1/logout
Sign out the current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204):** No content

---

### 5.2 Assets API

#### GET /rest/v1/assets
List assets with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `select` | string | Fields to return | `*,site:sites(name)` |
| `organization_id` | uuid | Filter by org | `eq.{uuid}` |
| `status` | enum | Asset status | `eq.operational` |
| `criticality` | enum | Criticality level | `in.(critical,high)` |
| `risk_score` | number | Risk threshold | `gte.0.7` |
| `site_id` | uuid | Filter by site | `eq.{uuid}` |
| `order` | string | Sort order | `risk_score.desc` |
| `limit` | integer | Page size | `25` |
| `offset` | integer | Skip records | `0` |

**Example Request:**
```bash
GET /rest/v1/assets?select=*,site:sites(name),asset_type:asset_types(name,category)&status=eq.operational&risk_score=gte.0.5&order=risk_score.desc&limit=20
```

**Response (200):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "asset_tag": "HVAC-CHI-001",
    "name": "Main Chiller Unit 1",
    "serial_number": "CH-2019-45678",
    "status": "operational",
    "criticality": "critical",
    "condition_score": 72,
    "risk_score": 0.68,
    "remaining_useful_life_years": 4.5,
    "installation_date": "2019-06-15",
    "warranty_expiry": "2024-06-15",
    "site": {
      "name": "Downtown Hospital"
    },
    "asset_type": {
      "name": "Centrifugal Chiller",
      "category": "HVAC"
    },
    "created_at": "2019-06-15T10:00:00Z",
    "updated_at": "2024-01-10T14:30:00Z"
  }
]
```

---

#### GET /rest/v1/assets/{id}
Get a single asset by ID.

**Response (200):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "organization_id": "org-uuid",
  "site_id": "site-uuid",
  "asset_type_id": "type-uuid",
  "asset_tag": "HVAC-CHI-001",
  "serial_number": "CH-2019-45678",
  "name": "Main Chiller Unit 1",
  "description": "Primary cooling unit for Building A",
  "installation_date": "2019-06-15",
  "warranty_expiry": "2024-06-15",
  "criticality": "critical",
  "status": "operational",
  "condition_score": 72,
  "risk_score": 0.68,
  "remaining_useful_life_years": 4.5,
  "location_details": {
    "building": "A",
    "floor": "B1",
    "room": "Mechanical Room 1"
  },
  "custom_fields": {
    "refrigerant_type": "R-134a",
    "last_calibration": "2023-11-15"
  },
  "assigned_technician_id": "tech-uuid",
  "created_at": "2019-06-15T10:00:00Z",
  "updated_at": "2024-01-10T14:30:00Z"
}
```

---

#### POST /rest/v1/assets
Create a new asset.

**Request:**
```json
{
  "organization_id": "org-uuid",
  "site_id": "site-uuid",
  "asset_type_id": "type-uuid",
  "asset_tag": "HVAC-CHI-002",
  "serial_number": "CH-2024-12345",
  "name": "Main Chiller Unit 2",
  "description": "Secondary cooling unit for Building A",
  "installation_date": "2024-01-20",
  "warranty_expiry": "2029-01-20",
  "criticality": "high",
  "status": "operational",
  "condition_score": 100,
  "location_details": {
    "building": "A",
    "floor": "B1",
    "room": "Mechanical Room 2"
  }
}
```

**Response (201):**
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "asset_tag": "HVAC-CHI-002",
  "created_at": "2024-01-20T09:00:00Z",
  ...
}
```

---

#### PATCH /rest/v1/assets?id=eq.{uuid}
Update an existing asset.

**Request:**
```json
{
  "condition_score": 65,
  "status": "degraded",
  "risk_score": 0.75
}
```

**Response (200):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "condition_score": 65,
  "status": "degraded",
  "risk_score": 0.75,
  "updated_at": "2024-01-20T10:00:00Z",
  ...
}
```

---

#### DELETE /rest/v1/assets?id=eq.{uuid}
Delete an asset (soft delete recommended).

**Response (204):** No content

---

### 5.3 Maintenance API

#### GET /rest/v1/maintenance_actions
List maintenance actions.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `asset_id` | uuid | Filter by asset |
| `status` | enum | Action status |
| `priority` | enum | Priority level |
| `scheduled_date` | date | Filter by date |
| `assigned_to` | uuid | Filter by technician |

**Response (200):**
```json
[
  {
    "id": "ma-uuid-1",
    "asset_id": "asset-uuid",
    "title": "Replace compressor seals",
    "description": "Vibration analysis indicates seal degradation",
    "priority": "high",
    "status": "scheduled",
    "estimated_cost": 8500.00,
    "estimated_hours": 4.5,
    "scheduled_date": "2024-02-01",
    "assigned_to": "tech-uuid",
    "ai_generated": true,
    "ai_confidence": 0.92,
    "ai_reasoning": "Vibration patterns match historical seal failure signature",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

---

#### POST /rest/v1/maintenance_actions
Create a maintenance action.

**Request:**
```json
{
  "asset_id": "asset-uuid",
  "title": "Quarterly filter replacement",
  "description": "Replace air filters as per PM schedule",
  "priority": "medium",
  "status": "pending",
  "estimated_cost": 450.00,
  "estimated_hours": 1.5,
  "scheduled_date": "2024-02-15"
}
```

**Response (201):** Created action object

---

#### PATCH /rest/v1/maintenance_actions?id=eq.{uuid}
Update action status and details.

**Request:**
```json
{
  "status": "completed",
  "actual_cost": 475.00,
  "actual_hours": 1.75,
  "completed_date": "2024-02-15T14:30:00Z"
}
```

---

#### GET /rest/v1/maintenance_history
Get historical maintenance records.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `asset_id` | uuid | Filter by asset |
| `maintenance_type` | enum | Type of maintenance |
| `performed_at` | timestamptz | Date range filter |

**Response (200):**
```json
[
  {
    "id": "mh-uuid-1",
    "asset_id": "asset-uuid",
    "action_id": "ma-uuid-1",
    "maintenance_type": "corrective",
    "description": "Replaced compressor seals due to excessive vibration",
    "cost": 8750.00,
    "labor_hours": 5.0,
    "downtime_hours": 6.5,
    "performed_by": "tech-uuid",
    "performed_at": "2024-02-01T09:00:00Z",
    "parts_used": [
      { "part_number": "SK-401", "quantity": 1, "cost": 2500.00 }
    ],
    "notes": "Root cause: bearing wear causing shaft misalignment"
  }
]
```

---

### 5.4 Prescriptive Maintenance API

#### POST /functions/v1/generate-maintenance-plan
Generate AI-powered maintenance recommendations.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "asset_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "include_parts": true,
  "budget_constraint": 50000,
  "time_horizon_months": 12,
  "priority_threshold": "medium"
}
```

**Response (200):**
```json
{
  "asset_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "asset_name": "Main Chiller Unit 1",
  "generated_at": "2024-01-20T10:00:00Z",
  "summary": {
    "total_actions": 8,
    "critical_actions": 2,
    "total_estimated_cost": 45750.00,
    "total_estimated_hours": 32.5,
    "projected_risk_reduction": 0.35
  },
  "actions": [
    {
      "id": "gen-action-1",
      "title": "Compressor seal replacement",
      "description": "Replace worn seals to prevent refrigerant leakage",
      "priority": "critical",
      "timeline": "Within 7 days",
      "recommended_date": "2024-01-27",
      "estimated_cost": 8500.00,
      "estimated_hours": 4.5,
      "estimated_downtime": 6.0,
      "ai_confidence": 0.94,
      "ai_reasoning": "Vibration analysis indicates 85% probability of seal failure within 30 days. Historical data shows similar patterns preceded failures in 12 other units.",
      "risk_if_deferred": "High probability of refrigerant leak and compressor damage",
      "parts_required": [
        {
          "part_number": "SK-401",
          "name": "Compressor Seal Kit",
          "quantity": 1,
          "in_stock": true,
          "stock_quantity": 3,
          "unit_cost": 2500.00
        }
      ],
      "labor_requirements": {
        "skill_level": "Senior Technician",
        "certifications_required": ["EPA 608", "OEM Certified"]
      }
    },
    {
      "id": "gen-action-2",
      "title": "Oil analysis and change",
      "description": "Perform oil analysis and replace if degraded",
      "priority": "high",
      "timeline": "Within 14 days",
      "recommended_date": "2024-02-03",
      "estimated_cost": 1200.00,
      "estimated_hours": 2.0,
      "estimated_downtime": 2.5,
      "ai_confidence": 0.88,
      "ai_reasoning": "Oil change is 45 days overdue. Degraded oil accelerates bearing wear.",
      "parts_required": [
        {
          "part_number": "OIL-COMP-5GAL",
          "name": "Compressor Oil 5-Gallon",
          "quantity": 2,
          "in_stock": true,
          "stock_quantity": 8,
          "unit_cost": 185.00
        }
      ]
    }
  ],
  "parts_summary": {
    "total_parts": 5,
    "in_stock": 4,
    "out_of_stock": 1,
    "total_parts_cost": 12500.00,
    "procurement_required": [
      {
        "part_number": "BRG-MAIN-001",
        "name": "Main Bearing Assembly",
        "quantity_needed": 1,
        "lead_time_days": 14,
        "estimated_cost": 4500.00
      }
    ]
  },
  "schedule_optimization": {
    "recommended_sequence": ["gen-action-1", "gen-action-2", "gen-action-3"],
    "batch_opportunities": [
      {
        "actions": ["gen-action-2", "gen-action-4"],
        "combined_downtime": 3.0,
        "savings_hours": 1.5
      }
    ]
  }
}
```

---

#### POST /functions/v1/calculate-risk-scores
Batch calculate risk scores for multiple assets.

**Request:**
```json
{
  "asset_ids": [
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "b2c3d4e5-f6a7-8901-bcde-f23456789012"
  ],
  "factors": ["age", "condition", "maintenance_history", "criticality", "usage"],
  "include_trend": true
}
```

**Response (200):**
```json
{
  "calculated_at": "2024-01-20T10:00:00Z",
  "results": [
    {
      "asset_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "risk_score": 0.78,
      "risk_level": "High",
      "failure_probability_30d": 0.42,
      "failure_probability_90d": 0.68,
      "factors": {
        "age_factor": {
          "value": 0.80,
          "weight": 0.25,
          "contribution": 0.20,
          "details": "Asset age 5.5 years of 8 year expected lifespan"
        },
        "condition_factor": {
          "value": 0.70,
          "weight": 0.35,
          "contribution": 0.245,
          "details": "Condition score 72/100"
        },
        "maintenance_factor": {
          "value": 0.85,
          "weight": 0.25,
          "contribution": 0.2125,
          "details": "PM overdue by 45 days"
        },
        "criticality_factor": {
          "value": 1.00,
          "weight": 0.15,
          "contribution": 0.15,
          "details": "Critical asset classification"
        }
      },
      "trend": {
        "direction": "increasing",
        "change_30d": 0.08,
        "change_90d": 0.15
      },
      "drivers": [
        "Overdue preventive maintenance",
        "Elevated vibration readings",
        "High runtime hours this quarter"
      ]
    }
  ]
}
```

---

### 5.5 Repair vs Replace API

#### POST /functions/v1/analyze-repair-replace
Generate repair vs replace recommendation.

**Request:**
```json
{
  "asset_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "projection_years": 5,
  "include_downtime_costs": true,
  "downtime_cost_per_hour": 2500,
  "discount_rate": 0.08,
  "include_energy_analysis": true
}
```

**Response (200):**
```json
{
  "asset_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "asset_name": "Main Chiller Unit 1",
  "analysis_date": "2024-01-20T10:00:00Z",
  "recommendation": {
    "action": "Replace",
    "confidence": 0.87,
    "urgency": "Next Quarter",
    "primary_reason": "Lower 5-year total cost of ownership",
    "savings": 42500.00
  },
  "current_asset": {
    "age_years": 5.5,
    "condition_score": 72,
    "remaining_useful_life": 2.5,
    "annual_maintenance_cost": 18500,
    "annual_energy_cost": 45000,
    "current_value": 25000
  },
  "cost_analysis": {
    "repair_option": {
      "year_1": 22000,
      "year_2": 28500,
      "year_3": 35000,
      "year_4": 42000,
      "year_5": 55000,
      "total_5_year": 182500,
      "npv": 148750
    },
    "replace_option": {
      "initial_cost": 85000,
      "year_1": 8500,
      "year_2": 9000,
      "year_3": 9500,
      "year_4": 10000,
      "year_5": 11000,
      "total_5_year": 133000,
      "npv": 112500
    },
    "break_even_year": 3
  },
  "downtime_analysis": {
    "repair_projected_downtime_hours": 120,
    "replace_projected_downtime_hours": 48,
    "repair_downtime_cost": 300000,
    "replace_downtime_cost": 120000
  },
  "energy_analysis": {
    "current_efficiency": 0.85,
    "new_model_efficiency": 0.95,
    "annual_energy_savings": 12000,
    "payback_from_energy": 7.1
  },
  "replacement_options": [
    {
      "model": "Carrier 30XA-200",
      "cost": 85000,
      "efficiency_rating": 0.95,
      "annual_energy_cost": 38000,
      "lead_time_weeks": 8,
      "payback_years": 3.2
    },
    {
      "model": "Trane CVGF",
      "cost": 92000,
      "efficiency_rating": 0.97,
      "annual_energy_cost": 35500,
      "lead_time_weeks": 10,
      "payback_years": 3.5
    }
  ],
  "risk_factors": {
    "repair_risks": [
      "Increasing failure probability",
      "Parts availability uncertainty",
      "Technician skill shortage"
    ],
    "replace_risks": [
      "Installation complexity",
      "Initial capital outlay",
      "Learning curve for new equipment"
    ]
  }
}
```

---

### 5.6 Benchmarking API

#### POST /functions/v1/fetch-benchmarks
Retrieve industry benchmarks for comparison.

**Request:**
```json
{
  "organization_id": "org-uuid",
  "metrics": ["mtbf", "mttr", "pm_compliance", "downtime_pct", "maintenance_cost_ratio"],
  "industry": "Healthcare",
  "asset_categories": ["HVAC", "Medical Equipment"],
  "period": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  }
}
```

**Response (200):**
```json
{
  "period": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  },
  "industry": "Healthcare",
  "organization_summary": {
    "total_assets": 245,
    "categories_analyzed": 2
  },
  "metrics": [
    {
      "metric": "MTBF (Hours)",
      "your_value": 2450,
      "peer_median": 2200,
      "peer_75th": 2800,
      "industry_best": 4500,
      "unit": "hours",
      "lower_is_better": false,
      "status": "Above Median",
      "percentile": 62,
      "trend": "+5.2%",
      "trend_direction": "improving"
    },
    {
      "metric": "MTTR (Hours)",
      "your_value": 4.2,
      "peer_median": 5.5,
      "peer_75th": 3.8,
      "industry_best": 2.1,
      "unit": "hours",
      "lower_is_better": true,
      "status": "Above Median",
      "percentile": 68,
      "trend": "-8.7%",
      "trend_direction": "improving"
    },
    {
      "metric": "PM Compliance",
      "your_value": 89.5,
      "peer_median": 85.0,
      "peer_75th": 92.0,
      "industry_best": 98.5,
      "unit": "%",
      "lower_is_better": false,
      "status": "Above Median",
      "percentile": 58,
      "trend": "+2.1%",
      "trend_direction": "improving"
    },
    {
      "metric": "Unplanned Downtime",
      "your_value": 3.8,
      "peer_median": 4.2,
      "peer_75th": 2.5,
      "industry_best": 0.8,
      "unit": "%",
      "lower_is_better": true,
      "status": "Above Median",
      "percentile": 55,
      "trend": "-12.3%",
      "trend_direction": "improving"
    }
  ],
  "by_category": {
    "HVAC": {
      "asset_count": 45,
      "performance_vs_benchmark": "Above Median",
      "improvement_opportunities": [
        "Increase PM frequency for chillers",
        "Implement predictive maintenance for AHUs"
      ]
    },
    "Medical Equipment": {
      "asset_count": 200,
      "performance_vs_benchmark": "Below Median",
      "improvement_opportunities": [
        "Reduce MTTR through parts pre-staging",
        "Improve first-time fix rate"
      ]
    }
  },
  "recommendations": [
    {
      "priority": "high",
      "area": "Medical Equipment MTTR",
      "current_gap": "15% above peer median",
      "suggested_actions": [
        "Pre-position critical spare parts",
        "Implement mobile diagnostic tools",
        "Enhance technician training program"
      ],
      "potential_improvement": "25% reduction in MTTR"
    }
  ]
}
```

---

### 5.7 AI Copilot API

#### POST /functions/v1/ai-copilot
Process natural language queries.

**Request:**
```json
{
  "message": "What are the top 5 assets at risk of failure in the next 30 days?",
  "conversation_id": "conv-uuid",
  "persona": "manager",
  "context": {
    "organization_id": "org-uuid",
    "site_id": "site-uuid",
    "filters": {
      "asset_categories": ["HVAC", "Electrical"]
    }
  }
}
```

**Response (200):**
```json
{
  "id": "msg-uuid",
  "conversation_id": "conv-uuid",
  "role": "assistant",
  "content": "Based on current risk analysis, here are the top 5 assets with highest failure probability in the next 30 days:\n\n1. **Chiller Unit 3** (HVAC-CHI-003) - 68% failure probability\n   - Primary driver: Compressor bearing wear\n   - Recommended action: Schedule bearing replacement\n\n2. **AHU-West Wing** (HVAC-AHU-012) - 52% failure probability\n   - Primary driver: Belt degradation\n   - Recommended action: Preventive belt replacement\n\n...",
  "message_type": "analysis",
  "metadata": {
    "query_type": "risk_analysis",
    "assets_referenced": [
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "b2c3d4e5-f6a7-8901-bcde-f23456789012"
    ],
    "confidence": 0.92,
    "data_freshness": "2024-01-20T09:45:00Z",
    "sources": ["risk_scores", "maintenance_history", "sensor_data"]
  },
  "suggested_actions": [
    {
      "label": "View detailed risk report",
      "action_type": "navigate",
      "target": "/prescriptive-maintenance?filter=high-risk"
    },
    {
      "label": "Schedule maintenance for top 3",
      "action_type": "create_work_orders",
      "asset_ids": ["uuid1", "uuid2", "uuid3"]
    }
  ],
  "follow_up_questions": [
    "What is the estimated cost to address all high-risk items?",
    "Show me the maintenance history for Chiller Unit 3",
    "Compare these assets to industry benchmarks"
  ],
  "created_at": "2024-01-20T10:00:00Z"
}
```

---

#### GET /rest/v1/copilot_conversations
List user's conversations.

**Query Parameters:**
- `user_id=eq.{uuid}` - Filter by user
- `order=updated_at.desc` - Sort by recent
- `limit=20` - Pagination

**Response (200):**
```json
[
  {
    "id": "conv-uuid-1",
    "user_id": "user-uuid",
    "organization_id": "org-uuid",
    "title": "Risk Analysis Discussion",
    "persona": "manager",
    "created_at": "2024-01-20T09:00:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  }
]
```

---

#### GET /rest/v1/copilot_messages
Get messages in a conversation.

**Query Parameters:**
- `conversation_id=eq.{uuid}` - Filter by conversation
- `order=created_at.asc` - Chronological order

**Response (200):**
```json
[
  {
    "id": "msg-uuid-1",
    "conversation_id": "conv-uuid",
    "role": "user",
    "content": "What are the top 5 assets at risk?",
    "message_type": "query",
    "created_at": "2024-01-20T10:00:00Z"
  },
  {
    "id": "msg-uuid-2",
    "conversation_id": "conv-uuid",
    "role": "assistant",
    "content": "Based on current risk analysis...",
    "message_type": "analysis",
    "metadata": { ... },
    "created_at": "2024-01-20T10:00:05Z"
  }
]
```

---

### 5.8 Export API

#### POST /functions/v1/export-data
Generate data exports in various formats.

**Request:**
```json
{
  "export_type": "assets",
  "format": "xlsx",
  "filters": {
    "organization_id": "org-uuid",
    "status": ["operational", "degraded"],
    "criticality": ["critical", "high"]
  },
  "columns": [
    "asset_tag",
    "name",
    "site_name",
    "status",
    "condition_score",
    "risk_score",
    "next_pm_date"
  ],
  "include_metadata": true
}
```

**Response (200):**
```json
{
  "export_id": "exp-uuid",
  "status": "completed",
  "file_url": "https://{project-ref}.supabase.co/storage/v1/object/sign/exports/asset-export-2024-01-20.xlsx?token=...",
  "expires_at": "2024-01-21T10:00:00Z",
  "record_count": 156,
  "file_size_bytes": 245678,
  "generated_at": "2024-01-20T10:00:00Z"
}
```

**Supported Export Types:**
- `assets` - Asset inventory
- `maintenance_actions` - Pending/scheduled actions
- `maintenance_history` - Historical records
- `risk_analysis` - Risk scores and factors
- `benchmarks` - Benchmark comparisons
- `repair_replace` - R/R analysis results

**Supported Formats:**
- `xlsx` - Excel spreadsheet
- `csv` - Comma-separated values
- `pdf` - PDF report
- `json` - Raw JSON data

---

## 6. Webhooks

### 6.1 Webhook Events

| Event | Description | Trigger |
|-------|-------------|---------|
| `asset.created` | New asset added | POST to assets |
| `asset.updated` | Asset modified | PATCH to assets |
| `asset.status_changed` | Status transition | Status field change |
| `maintenance.scheduled` | Action scheduled | New scheduled action |
| `maintenance.completed` | Action completed | Status → completed |
| `risk.threshold_exceeded` | Risk score high | Risk ≥ threshold |
| `copilot.recommendation` | AI recommendation | Critical AI insight |

### 6.2 Webhook Payload Schema

```typescript
interface WebhookPayload {
  id: string;                  // Event ID
  type: string;                // Event type
  created_at: string;          // ISO timestamp
  data: {
    old_record: object | null; // Previous state (updates)
    new_record: object;        // Current state
    table: string;             // Source table
  };
  metadata: {
    organization_id: string;
    triggered_by: string;      // User or system
  };
}
```

### 6.3 Webhook Example

```json
{
  "id": "evt-uuid",
  "type": "risk.threshold_exceeded",
  "created_at": "2024-01-20T10:00:00Z",
  "data": {
    "old_record": {
      "id": "asset-uuid",
      "risk_score": 0.65
    },
    "new_record": {
      "id": "asset-uuid",
      "risk_score": 0.78,
      "risk_level": "High"
    },
    "table": "assets"
  },
  "metadata": {
    "organization_id": "org-uuid",
    "triggered_by": "system:risk_calculator"
  }
}
```

---

## 7. SDK Usage

### 7.1 JavaScript/TypeScript Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://{project-ref}.supabase.co',
  'your-anon-key'
);

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Query assets
const { data: assets } = await supabase
  .from('assets')
  .select(`
    *,
    site:sites(name),
    asset_type:asset_types(name, category)
  `)
  .eq('status', 'operational')
  .gte('risk_score', 0.5)
  .order('risk_score', { ascending: false })
  .range(0, 19);

// Call edge function
const { data: plan } = await supabase.functions.invoke('generate-maintenance-plan', {
  body: {
    asset_id: 'asset-uuid',
    include_parts: true,
    time_horizon_months: 12
  }
});

// Real-time subscriptions
const channel = supabase
  .channel('asset-updates')
  .on(
    'postgres_changes',
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'assets',
      filter: 'risk_score=gte.0.7'
    },
    (payload) => {
      console.log('High-risk asset updated:', payload.new);
    }
  )
  .subscribe();
```

### 7.2 React Query Integration

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch assets hook
export function useAssets(filters: AssetFilters) {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: async () => {
      let query = supabase
        .from('assets')
        .select('*, site:sites(name)');
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.minRisk) {
        query = query.gte('risk_score', filters.minRisk);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

// Generate maintenance plan mutation
export function useGenerateMaintenancePlan() {
  return useMutation({
    mutationFn: async (params: MaintenancePlanParams) => {
      const { data, error } = await supabase.functions.invoke(
        'generate-maintenance-plan',
        { body: params }
      );
      if (error) throw error;
      return data;
    }
  });
}
```

---

## Appendix

### A. Type Definitions

```typescript
// Enums
type AssetCriticality = 'critical' | 'high' | 'medium' | 'low';
type AssetStatus = 'operational' | 'degraded' | 'failed' | 'maintenance' | 'decommissioned';
type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
type ActionStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'condition_based' | 'emergency';
type CopilotPersona = 'technician' | 'manager' | 'planner';
type MessageType = 'query' | 'recommendation' | 'analysis' | 'report' | 'insight';

// Common interfaces
interface PaginationParams {
  limit?: number;
  offset?: number;
  order?: string;
}

interface DateRangeFilter {
  start: string;  // ISO date
  end: string;    // ISO date
}
```

### B. Query Operators Reference

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `status=eq.operational` |
| `neq` | Not equals | `status=neq.failed` |
| `gt` | Greater than | `risk_score=gt.0.5` |
| `gte` | Greater or equal | `risk_score=gte.0.7` |
| `lt` | Less than | `condition_score=lt.50` |
| `lte` | Less or equal | `age=lte.5` |
| `like` | Pattern match | `name=like.*Chiller*` |
| `ilike` | Case-insensitive like | `name=ilike.*hvac*` |
| `in` | In array | `status=in.(operational,degraded)` |
| `is` | Is null/true/false | `assigned_to=is.null` |
| `or` | OR condition | `or=(status.eq.failed,risk_score.gte.0.8)` |
| `and` | AND condition | `and=(status.eq.operational,criticality.eq.critical)` |

---

*Last Updated: 2024-01-20*  
*API Version: 1.0.0*
