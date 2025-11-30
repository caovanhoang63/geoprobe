# GeoProbe Codebase Summary

**Last Updated**: 2025-11-30
**Phase**: Phase 03 - Core Dashboard Implementation
**Status**: Complete and Functional

## Project Overview

GeoProbe is a self-hosted, multi-location uptime monitoring solution built with SvelteKit 5, SQLite, and the Globalping REST API. It solves the "location bias" problem by dispatching probes to residential and datacenter networks worldwide for comprehensive endpoint monitoring.

**Tech Stack**:
- Framework: SvelteKit 5 (Node.js Adapter)
- Language: TypeScript (strict mode)
- Database: SQLite via Better-SQLite3 + Drizzle ORM
- Styling: Tailwind CSS + DaisyUI
- Scheduler: node-cron
- External API: Globalping REST API

## Directory Structure

```
src/
├── lib/
│   ├── components/          # Phase 03 Svelte Components
│   │   ├── Sidebar.svelte           # 280px fixed sidebar with nav
│   │   ├── MonitorListItem.svelte   # Individual monitor list item
│   │   ├── UptimeBars.svelte        # 30-segment uptime visualization
│   │   └── ActionButtons.svelte     # Monitor control actions (Pause/Edit/Delete)
│   ├── server/
│   │   ├── db.ts                    # Database initialization (WAL mode, FK enabled)
│   │   ├── schema.ts                # Drizzle ORM schema (monitors, measurements)
│   │   ├── checker.ts               # Monitor execution logic
│   │   ├── cron.ts                  # Scheduler initialization (5-min interval)
│   │   └── globalping.ts            # Globalping API client (poll + measurement)
│   ├── types/
│   │   └── globalping.ts            # Type definitions for API payloads
│   └── index.ts
├── routes/
│   ├── +layout.svelte               # Root layout with favicon
│   ├── +page.svelte                 # Main dashboard (Phase 03)
│   └── api/
│       └── test-check/
│           └── +server.ts           # Test measurement endpoint
├── app.css                          # Tailwind directives
├── app.d.ts                         # App types
└── app.html                         # HTML template

migrations/                          # Drizzle ORM migrations
├── 0000_breezy_captain_cross.sql
└── meta/

docs/
├── design-guidelines.md             # Design system & component specs
└── codebase-summary.md              # This file
```

## Component Architecture (Phase 03)

### 1. **Sidebar.svelte** (280px Fixed Navigation)
**Purpose**: Fixed left sidebar for monitor list and navigation

**Features**:
- Logo + branding header (64px height)
- "Add New Monitor" button (emerald green, 10b981)
- Search bar with magnifying glass icon
- Monitor list container (flex-1 scrollable)
- Fixed width (280px) with dark theme (#1e2228 background)

**Props**:
```typescript
interface Props {
  children?: Snippet;
}
```

**Styling**:
- Fixed positioning, h-screen, overflow-y-auto
- Border-right divider (#2d3139)
- Button with hover shadow and gradient hover state
- Search input with focus state (emerald border + shadow)

### 2. **MonitorListItem.svelte** (Monitor Status Display)
**Purpose**: Individual monitor list item with status badge and uptime

**Features**:
- Status badge (Pill-shaped, 11px font)
  - Green (#10b981) for "Up"
  - Red (#ef4444) for "Down"
  - Shows uptime percentage
- Monitor name truncated
- Active state: left emerald border (3px) + highlighted background
- Hover effect: background change + transition

**Props**:
```typescript
interface Monitor {
  id: string;
  name: string;
  status: 'up' | 'down';
  uptimePercentage: number;
}

interface Props {
  monitor: Monitor;
  active: boolean;
  onclick: () => void;
}
```

**Styling**:
- 100% width, py-3 px-4, border-bottom divider
- Flex with gap-3 alignment
- Hover background (#2a2f38) transition

### 3. **UptimeBars.svelte** (30-Segment Uptime Visualization)
**Purpose**: Hour-by-hour uptime visualization for last 30 hours

**Features**:
- 30 vertical bars (12px width, 40px height each)
- 4px gap between bars
- Status colors: Green (up) / Red (down) / Gray (unknown)
- Hover effect: scale-y-110 + glow shadow
- Tooltip on hover showing timestamp formatted as "Mon DD, HH:mm AM/PM"
- Responsive tooltip positioning (absolute, bottom-full)

**Props**:
```typescript
interface UptimeData {
  status: 'up' | 'down' | 'unknown';
  timestamp: number;
}

interface Props {
  uptimeData: UptimeData[];
}
```

**Styling**:
- Flex with gap-1, items-end, h-10
- SVG-like bar styling with rounded corners
- Group hover with tooltip opacity transition

### 4. **ActionButtons.svelte** (Monitor Control Actions)
**Purpose**: Action buttons for monitor management

**Features**:
- Pause button: Gray bordered, emoji icon ⏸
- Edit button: Gray bordered, emoji icon ✏
- Delete button: Red background, emoji icon 🗑
- All buttons: rounded-md, flex gap-1.5
- Hover effects: color + shadow transitions

**Props**:
```typescript
interface Props {
  onPause: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```

**Styling**:
- Flex gap-3 container
- Secondary buttons: transparent bg, bordered (#3a3f4a), text-gray
- Danger button: red background (#ef4444), white text
- Hover: background transition, shadow for danger

### 5. **Dashboard (+page.svelte)** (Main Layout)
**Purpose**: Main dashboard layout integrating all components

**Layout**:
```
┌────────────────────────────────────────────────┐
│ Sidebar (280px)  │  Monitor Detail              │
│                  ├─────────────────────────────┤
│ [Add Monitor]    │  Title & URL                 │
│ [Search]         ├─────────────────────────────┤
│                  │  Uptime History (30 hours)   │
│ [List Items]     ├─────────────────────────────┤
│                  │  Status Badge                │
└────────────────────────────────────────────────┘
                   ├─────────────────────────────┤
                   │  Action Buttons              │
                   ├─────────────────────────────┤
                   │  Metrics (placeholder)       │
                   └─────────────────────────────┘
```

**Features**:
- Main content ml-[280px] (sidebar offset)
- Responsive grid for metrics
- Dark theme backgrounds (#1a1d21 main, #242830 cards)
- Max-width container (7xl)
- Section spacing and typography hierarchy

## Database Schema

### Monitors Table
```sql
CREATE TABLE `monitors` (
  `id` text PRIMARY KEY NOT NULL (UUID),
  `name` text NOT NULL,
  `url` text NOT NULL,
  `interval` integer NOT NULL DEFAULT 300,
  `locations` text NOT NULL (JSON stringified),
  `active` integer NOT NULL DEFAULT true,
  `created_at` text NOT NULL (ISO 8601),
  `updated_at` text NOT NULL (ISO 8601)
);
```

**Drizzle Definition**:
```typescript
export const monitors = sqliteTable('monitors', {
  id: text('id').primaryKey().$defaultFn(() => uuid()),
  name: text('name').notNull(),
  url: text('url').notNull(),
  interval: integer('interval').notNull().default(300),
  locations: text('locations').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
});
```

### Measurements Table
```sql
CREATE TABLE `measurements` (
  `id` text PRIMARY KEY NOT NULL (UUID),
  `monitor_id` text NOT NULL (FK -> monitors.id CASCADE),
  `location` text NOT NULL,
  `country` text,
  `city` text,
  `network_type` text,
  `status_code` integer,
  `latency` real NOT NULL,
  `status` text NOT NULL,
  `error_message` text,
  `timestamp` text NOT NULL (ISO 8601),
  FOREIGN KEY (`monitor_id`) REFERENCES `monitors`(`id`) ON DELETE CASCADE
);

CREATE INDEX `monitor_id_timestamp_idx` ON `measurements` (`monitor_id`, `timestamp`);
```

## Server-Side Architecture

### Database Initialization (db.ts)
```typescript
- WAL mode: sqlite.pragma('journal_mode = WAL')
- Foreign keys enabled: sqlite.pragma('foreign_keys = ON')
- Auto-migrations on startup via Drizzle
```

**Purpose**: Ensures data consistency and supports concurrent reads with better performance.

### Cron Scheduler (cron.ts)
```typescript
- Runs every 5 minutes: cron.schedule('*/5 * * * *', runAllChecks)
- Fetches all active monitors
- Executes checkMonitor() for each
- Logs success/error counts
- Error handling with try-catch
```

**Function**: `initializeCron()` called from SvelteKit hooks.server.ts

### Measurement Checker (checker.ts)
```typescript
checkMonitor(monitor: Monitor): Promise<void>
- Parses monitor.locations (JSON string -> LocationFilter[])
- Calls runMeasurement() via Globalping API
- Transforms probe results into database records
- Batch inserts into measurements table
- Handles network_type detection (tags.includes('residential'))
```

### Globalping API Client (globalping.ts)
```typescript
createMeasurement(request): Promise<string>
  - POST /v1/measurements
  - Returns measurement ID

pollMeasurement(id): Promise<GlobalpingResponse>
  - Exponential backoff: 1s → 1.5s → 5s max
  - 20 max attempts
  - Returns when status !== 'in-progress'

runMeasurement(request): Promise<GlobalpingResponse>
  - Combines create + poll
  - Single interface for measurement execution
```

## Type Definitions

### Globalping Types (lib/types/globalping.ts)

```typescript
interface LocationFilter {
  country?: string;
  continent?: string;
  city?: string;
  tags?: string[];
}

interface GlobalpingRequest {
  type: 'http';
  target: string;
  locations: LocationFilter[];
  options?: { timeout?: number };
}

interface GlobalpingResponse {
  id: string;
  status: 'in-progress' | 'completed' | 'failed';
  type: string;
  target: string;
  results?: ProbeResult[];
}

interface ProbeResult {
  probe: {
    country: string;
    city: string;
    continent: string;
    tags: string[];
  };
  result: {
    status: 'finished' | 'failed';
    statusCode?: number;
    timings?: { total: number; firstByte: number; download: number };
    rawError?: string;
  };
}
```

## Key Deployment Constraints

**Important**: GeoProbe requires a persistent Node.js process and CANNOT run on serverless platforms (Vercel, Netlify).

**Supported Platforms**: VPS, Docker, Railway, Fly.io, DigitalOcean, etc.

**Deployment Configuration**:
```dockerfile
# Requires long-running process for node-cron scheduler
# See docker-compose.yml in project root for full config
```

## Environment Variables

```env
DATABASE_URL=file:./data.db              # SQLite database path
DISCORD_WEBHOOK_URL=https://discord...  # Discord alerting (optional Phase 04)
ORIGIN=http://localhost:3000            # SvelteKit origin
```

## Development Workflows

### Install & Setup
```bash
pnpm install
cp .env.example .env
pnpm run db:push    # Drizzle migrations
pnpm run dev        # SvelteKit dev server (localhost:5173)
```

### Database Management
```bash
pnpm run db:generate  # Generate migration files
pnpm run db:push      # Apply migrations
pnpm run db:studio    # Drizzle Studio (visual DB editor)
```

### Testing
```bash
# Manual API test
curl -X POST http://localhost:5173/api/test-check

# Database test script
tsx scripts/test-db.ts
```

## Phase Completion Status

### Phase 03: Core Dashboard Implementation ✓ COMPLETE
- [x] Sidebar component with navigation
- [x] MonitorListItem component with status display
- [x] UptimeBars component (30-segment visualization)
- [x] ActionButtons component (Pause/Edit/Delete)
- [x] Dashboard main layout integration
- [x] Dark theme with Tailwind CSS
- [x] Database schema (monitors & measurements)
- [x] Cron scheduler (5-minute intervals)
- [x] Globalping API client (create + poll)
- [x] Monitor checker (transform + batch insert)
- [x] Type-safe implementation (strict TypeScript)

### Phase 04: Pending
- [ ] Metrics visualization (response time charts)
- [ ] Real-time updates (WebSocket/polling)
- [ ] Discord webhook alerting
- [ ] Monitor CRUD operations

## File Imports & Module Organization

**Component Usage** (+page.svelte):
```typescript
import Sidebar from '$lib/components/Sidebar.svelte';
import MonitorListItem from '$lib/components/MonitorListItem.svelte';
import UptimeBars from '$lib/components/UptimeBars.svelte';
import ActionButtons from '$lib/components/ActionButtons.svelte';
```

**Server Imports** (cron.ts, checker.ts):
```typescript
import { db } from './db';
import { monitors, measurements } from './schema';
import { runMeasurement } from './globalping';
import type { Monitor, LocationFilter } from './types';
```

**Aliases Available**:
- `$lib`: src/lib/
- `$lib/components`: src/lib/components/
- `$lib/server`: src/lib/server/
- `$lib/types`: src/lib/types/

## Configuration Files

| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Tailwind theme (dark, colors, fonts) |
| `drizzle.config.ts` | Drizzle ORM settings (schema, migrations) |
| `tsconfig.json` | TypeScript (strict: true, noUncheckedIndexedAccess) |
| `svelte.config.js` | SvelteKit config (Node adapter) |
| `vite.config.ts` | Vite bundler config |
| `postcss.config.js` | PostCSS (Tailwind, autoprefixer) |

## Styling Architecture

### Tailwind Configuration
- **Base colors**: Custom theme in tailwind.config.ts
- **Dark theme only**: Set via daisyui.darkTheme
- **Custom colors**: bg-darkest, bg-card, bg-input
- **Fonts**: Inter (Google Fonts, loaded in app.html)
- **Spacing**: 4px base unit (Tailwind default)

### Design System Integration
- All components use inline Tailwind classes
- No CSS modules or component scoping
- Design guidelines in docs/design-guidelines.md
- Color values match Uptime Kuma aesthetic

## Performance Considerations

**Database**:
- WAL mode for concurrent reads
- Indexed query: monitor_id_timestamp_idx on measurements
- FK cascade delete for data consistency

**API**:
- Exponential backoff for Globalping polling
- 20-attempt max (reduces stuck requests)
- Batch insert measurements (single transaction)

**Frontend**:
- Component runes syntax (Svelte 5)
- Reactive declarations ($derived)
- No unnecessary re-renders (state isolation)

## Known Limitations & TODOs

### Current Scope (Phase 03)
- Dashboard is read-only (mock data)
- No real-time monitor updates yet
- Limited to single theme (dark)
- No alerting/notifications
- No metrics visualization beyond uptime bars

### Future Phases
- Status Page mode (public vs admin)
- TCP/Ping/DNS check types
- Multi-alert channels (Slack, Telegram)
- ISP latency comparison
- Mobile app (React Native)

## References

- **Globalping API**: https://globalping.io/docs/api.globalping.io
- **SvelteKit**: https://kit.svelte.dev/
- **Drizzle ORM**: https://orm.drizzle.team/
- **Tailwind CSS**: https://tailwindcss.com/
- **Design Inspiration**: Uptime Kuma (https://uptime.kuma.pet/)
