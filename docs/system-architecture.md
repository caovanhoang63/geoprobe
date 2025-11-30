# System Architecture - GeoProbe

**Document Version**: 1.0
**Date**: 2025-11-30
**Architecture Phase**: Phase 03 - Core Foundation
**Status**: Active & Functional

## High-Level Architecture

GeoProbe is a **self-hosted, distributed monitoring system** that combines:
- **Frontend**: SvelteKit-based SSR dashboard
- **Backend**: Node.js background scheduler + API
- **Database**: SQLite with Drizzle ORM
- **External Integration**: Globalping REST API + Discord Webhooks

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                        │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SvelteKit SSR App (Port 3000)                         │ │
│  │  ├─ +page.svelte (Dashboard)                           │ │
│  │  ├─ +layout.svelte (Root)                              │ │
│  │  └─ /api/test-check (Manual trigger)                   │ │
│  │                                                         │ │
│  │  Components:                                           │ │
│  │  ├─ Sidebar (nav, search, monitor list)               │ │
│  │  ├─ MonitorListItem (status + uptime)                 │ │
│  │  ├─ UptimeBars (30-hour visualization)                │ │
│  │  ├─ ActionButtons (pause/edit/delete)                 │ │
│  │  └─ Dashboard (main layout)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │     Application Server (Node.js)     │
        └──────────────────────────────────────┘
                  ↙                    ↘
    ┌──────────────────────┐   ┌──────────────────┐
    │  Scheduler Process   │   │   API Routes     │
    │  (node-cron)         │   │   (/api/*)       │
    │                      │   │                  │
    │  Every 5 minutes:    │   │  POST test-check │
    │  ├─ Query monitors   │   │  (manual trigger)│
    │  ├─ For each:        │   │                  │
    │  │  └─ checkMonitor()│   │                  │
    │  └─ Batch insert     │   │                  │
    └──────────────────────┘   └──────────────────┘
                  ↓                    ↓
        ┌────────────────────────────────────┐
        │   SQLite Database (data.db)        │
        │                                    │
        │   ├─ monitors table (config)       │
        │   └─ measurements table (history)  │
        │                                    │
        │   Mode: WAL (Write-Ahead Log)      │
        │   Features:                        │
        │   ├─ Foreign keys enabled          │
        │   ├─ Indexed queries               │
        │   └─ Transaction support           │
        └────────────────────────────────────┘
```

## Component Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│  (Svelte Components, CSS/Tailwind)                     │
│                                                         │
│  ├─ Sidebar                                            │
│  ├─ MonitorListItem                                    │
│  ├─ UptimeBars                                         │
│  ├─ ActionButtons                                      │
│  └─ Dashboard (orchestrator)                           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (SvelteKit Routes & Page Logic)                        │
│                                                         │
│  ├─ +page.svelte (Dashboard controller)                │
│  ├─ +page.server.ts (SSR data fetching - Phase 04)    │
│  ├─ +layout.svelte (Root layout)                       │
│  └─ /api/test-check/+server.ts (API endpoint)          │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                  │
│  (Monitors, Checks, Measurements)                       │
│                                                         │
│  ├─ checker.ts (checkMonitor logic)                     │
│  ├─ globalping.ts (API client)                         │
│  ├─ cron.ts (Scheduler)                                │
│  └─ hooks.server.ts (App initialization)               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                     │
│  (Drizzle ORM + SQLite)                                 │
│                                                         │
│  ├─ schema.ts (Table definitions)                       │
│  ├─ db.ts (Database initialization)                    │
│  └─ migrations/ (Schema versions)                       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                            │
│  (SQLite Database File)                                 │
│                                                         │
│  ├─ data.db (main file)                                │
│  ├─ data.db-shm (shared memory)                         │
│  └─ data.db-wal (write-ahead log)                       │
└─────────────────────────────────────────────────────────┘
```

## Execution Flow

### Application Startup Sequence

```
1. SvelteKit App Starts (npm run dev / node build)
   ↓
2. src/lib/server/db.ts Loads
   ├─ Create SQLite connection
   ├─ Enable WAL mode: sqlite.pragma('journal_mode = WAL')
   ├─ Enable foreign keys: sqlite.pragma('foreign_keys = ON')
   └─ Run Drizzle migrations: migrate(db, { migrationsFolder: './migrations' })
   ↓
3. hooks.server.ts Executes (SvelteKit server hook)
   ├─ Import cron module
   └─ Call initializeCron()
   ↓
4. cron.ts Initializes
   ├─ Create scheduled task: cron.schedule('*/5 * * * *', runAllChecks)
   └─ Log: "[Cron] Scheduler initialized - checks every 5 minutes"
   ↓
5. App Ready
   ├─ Listen on ORIGIN (default http://localhost:3000)
   └─ Background scheduler running
```

### Monitor Check Execution Flow

**Triggered**: Every 5 minutes by node-cron

```
Time: XX:00:00 (cron fires)
  ↓
1. runAllChecks() Executes
   ├─ Log: "[Cron] Starting monitor checks..."
   ├─ Start timing
   └─ Try-catch for error handling
   ↓
2. Query Active Monitors
   ├─ db.select().from(monitors).where(eq(monitors.active, true))
   ├─ Filter only active=true monitors
   └─ Get array of Monitor objects
   ↓
3. For Each Monitor
   │
   ├─ Call checkMonitor(monitor)
   │  ├─ Log: "[Checker] Starting check for {name}"
   │  ├─ Parse monitor.locations JSON → LocationFilter[]
   │  │  Example: [{ country: 'US' }, { country: 'DE' }]
   │  │
   │  ├─ Call runMeasurement(request)
   │  │  ├─ POST /v1/measurements to Globalping API
   │  │  │  Body: { type: 'http', target: url, locations, options }
   │  │  ├─ Receive measurement ID
   │  │  │
   │  │  └─ Poll /v1/measurements/{id}
   │  │     ├─ Backoff: 1s, 1.5s, 2.25s, ... up to 5s
   │  │     ├─ Max attempts: 20
   │  │     ├─ Check if status !== 'in-progress'
   │  │     └─ Return when completed or error
   │  │
   │  ├─ Transform Results
   │  │  └─ For each probe result:
   │  │     ├─ Extract: country, city, network_type, statusCode, latency
   │  │     ├─ Detect network_type from tags
   │  │     └─ Create measurement object
   │  │
   │  ├─ Batch Insert Measurements
   │  │  └─ db.insert(measurements).values(results)
   │  │
   │  ├─ Error Handling
   │  │  └─ Log errors, continue to next monitor
   │  │
   │  └─ Log success: "{N} measurements stored"
   │
   ├─ Increment successCount
   └─ Or catch error → Increment errorCount
   ↓
4. Completion
   ├─ Calculate duration
   └─ Log: "Completed in XXms - Success: X, Errors: Y"
```

### Manual Check (Test API)

**Triggered**: HTTP POST /api/test-check

```
POST http://localhost:3000/api/test-check
  ↓
1. Handler: src/routes/api/test-check/+server.ts
   ├─ Query first active monitor
   ├─ If none found → return 404 error
   └─ If found → proceed
   ↓
2. Call checkMonitor(monitor)
   └─ (same as cron execution flow above)
   ↓
3. Return Response
   ├─ Success: { success: true, monitorId: "uuid" }
   └─ Error: { error: "message" } (HTTP 500)
```

## Database Schema Architecture

### Entity-Relationship Diagram

```
┌─────────────────────────────────────┐
│          MONITORS                    │
├─────────────────────────────────────┤
│ id (PK, UUID)                       │
│ name (string)                       │
│ url (string)                        │
│ interval (int, default 300s)        │
│ locations (JSON string)             │
│ active (boolean, default true)      │
│ created_at (ISO 8601)               │
│ updated_at (ISO 8601)               │
└──────────────┬──────────────────────┘
               │
               │ 1:N relationship
               │ onDelete: CASCADE
               │
               ↓
┌─────────────────────────────────────┐
│       MEASUREMENTS                   │
├─────────────────────────────────────┤
│ id (PK, UUID)                       │
│ monitor_id (FK → monitors.id)       │
│ location (string: "City, Country")  │
│ country (string)                    │
│ city (string)                       │
│ network_type (enum)                 │
│ status_code (int, nullable)         │
│ latency (real, milliseconds)        │
│ status (enum: success|failed)       │
│ error_message (string, nullable)    │
│ timestamp (ISO 8601)                │
│                                     │
│ Indexes:                            │
│ - PK: id                            │
│ - Composite: (monitor_id, timestamp)│
│ - FK: monitor_id                    │
└─────────────────────────────────────┘
```

### Monitors Table

**Purpose**: Configuration and metadata for monitored endpoints

| Column | Type | Constraints | Default | Notes |
|--------|------|-----------|---------|-------|
| id | TEXT | PRIMARY KEY | uuid() | Unique identifier (v4) |
| name | TEXT | NOT NULL | — | Display name (e.g., "Production API") |
| url | TEXT | NOT NULL | — | Target URL (e.g., "https://api.example.com") |
| interval | INTEGER | NOT NULL | 300 | Check frequency in seconds |
| locations | TEXT | NOT NULL | — | JSON array of LocationFilter objects |
| active | BOOLEAN | NOT NULL | true | Enable/disable monitor |
| created_at | TEXT | NOT NULL | now() | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL | now() | ISO 8601 timestamp |

**Example Row**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Production API",
  "url": "https://api.example.com",
  "interval": 300,
  "locations": "[{\"country\":\"US\"},{\"country\":\"DE\"},{\"city\":\"Singapore\"}]",
  "active": true,
  "created_at": "2025-11-30T12:00:00Z",
  "updated_at": "2025-11-30T12:00:00Z"
}
```

### Measurements Table

**Purpose**: Historical health check results per location

| Column | Type | Constraints | Default | Notes |
|--------|------|-----------|---------|-------|
| id | TEXT | PRIMARY KEY | uuid() | Measurement record ID |
| monitor_id | TEXT | NOT NULL, FK | — | Links to monitors.id |
| location | TEXT | NOT NULL | — | Human-readable location |
| country | TEXT | NULLABLE | — | ISO country code |
| city | TEXT | NULLABLE | — | City name |
| network_type | TEXT | NULLABLE | — | 'residential' or 'datacenter' |
| status_code | INTEGER | NULLABLE | — | HTTP status (e.g., 200, 503) |
| latency | REAL | NOT NULL | — | Response time in milliseconds |
| status | TEXT | NOT NULL | — | 'success' or 'failed' |
| error_message | TEXT | NULLABLE | — | Error description if failed |
| timestamp | TEXT | NOT NULL | now() | ISO 8601 check timestamp |

**Example Row**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440111",
  "monitor_id": "550e8400-e29b-41d4-a716-446655440000",
  "location": "New York, United States",
  "country": "US",
  "city": "New York",
  "network_type": "datacenter",
  "status_code": 200,
  "latency": 45.5,
  "status": "success",
  "error_message": null,
  "timestamp": "2025-11-30T12:05:00Z"
}
```

### Query Patterns

**Get Latest Check for Monitor**:
```sql
SELECT * FROM measurements
WHERE monitor_id = ?
ORDER BY timestamp DESC
LIMIT 1
```
*Uses index: monitor_id_timestamp_idx*

**Get Uptime for Last 30 Days**:
```sql
SELECT COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*) as uptime_pct
FROM measurements
WHERE monitor_id = ? AND timestamp >= datetime('now', '-30 days')
```

**Get Latest from Each Location**:
```sql
SELECT DISTINCT ON (location) *
FROM measurements
WHERE monitor_id = ?
ORDER BY location, timestamp DESC
```

## API Integration Architecture

### Globalping API Client (globalping.ts)

**External Service**: Globalping REST API (https://api.globalping.io/v1)

```
┌─────────────────────────────────────┐
│   GeoProbe checkMonitor() Process   │
└──────────────┬──────────────────────┘
               ↓
       ┌───────────────────┐
       │ createMeasurement │
       │ (async)           │
       └───────────┬───────┘
                   ↓
       POST /v1/measurements
       Headers: Content-Type: application/json
       Body: {
         "type": "http",
         "target": "https://api.example.com",
         "locations": [
           { "country": "US" },
           { "country": "DE" }
         ],
         "options": { "timeout": 10000 }
       }
                   ↓
       Response 200 OK:
       {
         "id": "jnhrklmn",
         "status": "in-progress",
         ...
       }
                   ↓
       ┌───────────────────┐
       │ pollMeasurement   │
       │ (async loop)      │
       └───────────┬───────┘
                   ↓
       GET /v1/measurements/jnhrklmn
       (Repeat with exponential backoff)
                   ↓
       Attempt 1: Wait 1000ms → Status: in-progress
       Attempt 2: Wait 1500ms → Status: in-progress
       Attempt 3: Wait 2250ms → Status: in-progress
       ...
       Attempt N: Status: completed
                   ↓
       Return complete response with results array
                   ↓
       ┌────────────────────┐
       │ Transform & Store  │
       │ to SQLite          │
       └────────────────────┘
```

### GlobalpingRequest Type

```typescript
interface GlobalpingRequest {
  type: 'http';                          // Only HTTP currently (Phase 04+: TCP, Ping)
  target: string;                        // URL to check
  locations: LocationFilter[];           // Geographic filters
  options?: {
    timeout?: number;                    // Milliseconds (default 10000)
  };
}

interface LocationFilter {
  country?: string;                      // ISO country code (e.g., "US")
  continent?: string;                    // Continent name (e.g., "Africa")
  city?: string;                         // City name (e.g., "Tokyo")
  tags?: string[];                       // Special tags (e.g., ["residential"])
}
```

### GlobalpingResponse Type

```typescript
interface GlobalpingResponse {
  id: string;                            // Measurement ID for polling
  status: 'in-progress' | 'completed' | 'failed';
  type: string;                          // Echo of request type
  target: string;                        // Echo of target
  results?: ProbeResult[];               // Array of per-location results
}

interface ProbeResult {
  probe: {
    country: string;
    city: string;
    continent: string;
    tags: string[];                      // e.g., ["residential", "ipv4"]
  };
  result: {
    status: 'finished' | 'failed';
    statusCode?: number;                 // HTTP status (e.g., 200)
    timings?: {
      total: number;                     // Total latency (ms)
      firstByte: number;                 // Time to first byte (ms)
      download: number;                  // Download time (ms)
    };
    rawError?: string;                   // Error message if failed
  };
}
```

## Scheduler Architecture (node-cron)

### Initialization

**Location**: hooks.server.ts (SvelteKit server hook)

```typescript
import { initializeCron } from '$lib/server/cron';

export async function init() {
  initializeCron();  // Runs once on app startup
  console.log('[App] Scheduler initialized');
}
```

### Cron Pattern

**Expression**: `'*/5 * * * *'` (Every 5 minutes)

```
Field:   Minute  Hour  Day  Month  Day-of-Week
Pattern:   */5    *     *     *       *
Meaning: Every 5 minutes, every hour, every day
```

**Execution Times**: 00:00, 00:05, 00:10, 00:15, 00:20, ...

### Execution Characteristics

| Property | Value | Notes |
|----------|-------|-------|
| Frequency | Every 5 minutes | Configurable, default 300s |
| Parallelism | Sequential | Checks run one after another |
| Timeout | None (implicit) | Respects Globalping API timeout |
| Error handling | Try-catch | Logs errors, continues to next |
| Logging | Detailed | [Cron] prefix for tracing |
| Persistence | In-memory | Restarts on app restart |

### State Management

```typescript
// File: src/lib/server/cron.ts
let cronJob: cron.ScheduledTask | null = null;

export function initializeCron(): void {
  if (cronJob) {
    console.log('[Cron] Already initialized, skipping...');
    return;
  }

  cronJob = cron.schedule('*/5 * * * *', runAllChecks);
  console.log('[Cron] Scheduler initialized - checks every 5 minutes');
}

export function stopCron(): void {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('[Cron] Scheduler stopped');
  }
}
```

**Note**: stopCron() is called during graceful shutdown (not implemented yet - Phase 04).

## Data Consistency & Integrity

### Foreign Key Constraints

```sql
FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
```

**Behavior**:
- When monitor is deleted → all measurements automatically cascade-deleted
- Prevents orphaned measurement records
- Enforced by SQLite (enabled in db.ts)

### Transaction Isolation

**SQLite Default**: DEFERRED transactions
- Write transactions block reads during commit
- Read transactions don't block writes
- Suitable for single-writer (cron job) scenario

### Index Strategy

**Primary Index**: `monitor_id_timestamp_idx` (composite)

```sql
CREATE INDEX monitor_id_timestamp_idx ON measurements (monitor_id, timestamp)
```

**Usage**:
- Speeds up queries filtering by monitor_id + date range
- Typical query: `WHERE monitor_id = ? AND timestamp >= ?`
- Without index: full table scan (slow at scale)

### Data Retention

**Current**: No automatic cleanup (Phase 05)
**Recommendation**:
- 30-day default retention
- Configurable per monitor
- Optional export before deletion

## Deployment Architecture

### Single-Server Deployment

```
┌──────────────────────────────────┐
│      Virtual Machine / VPS        │
│  (e.g., DigitalOcean, Linode)    │
│                                  │
│  ┌────────────────────────────┐  │
│  │     Node.js 18+ Runtime    │  │
│  │                            │  │
│  │  ┌──────────────────────┐  │  │
│  │  │  SvelteKit App       │  │  │
│  │  │  Port 3000           │  │  │
│  │  │                      │  │  │
│  │  │  • Dashboard SSR     │  │  │
│  │  │  • API endpoints     │  │  │
│  │  │  • Scheduler (cron)  │  │  │
│  │  └──────────────────────┘  │  │
│  │         ↓                   │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ SQLite Database      │  │  │
│  │  │ data.db              │  │  │
│  │  │ (Single-file DB)     │  │  │
│  │  └──────────────────────┘  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
         ↓ (Reverse Proxy)
    ┌─────────────────────┐
    │  nginx / Caddy      │
    │  HTTP ↔ HTTPS       │
    │  SSL termination    │
    └─────────────────────┘
         ↓
    ┌─────────────────────┐
    │  Public Internet    │
    │  (User Access)      │
    └─────────────────────┘
```

### Docker Deployment

```dockerfile
# Production image
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "build"]

# Persistent volume for SQLite
VOLUME ["/app/data"]
```

**Deployment**:
```yaml
services:
  geoprobe:
    image: geoprobe:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=file:/app/data/geoprobe.db
      - ORIGIN=https://monitor.example.com
    restart: unless-stopped
```

### Multi-Instance Deployment (Future)

**Challenge**: Distributed scheduler (two instances running cron = duplicate checks)

**Solution**:
1. Lease-based leader election (Phase 05)
2. Or: Central cron service + stateless API instances
3. Or: Sticky scheduling (monitor assigned to instance)

## Performance Characteristics

### Latency

| Operation | Typical | Notes |
|-----------|---------|-------|
| Page load (SSR) | < 200ms | Cached, no API call |
| Single check | 5-30s | Depends on Globalping API |
| Dashboard render | < 100ms | Client-side Svelte |
| DB query (single) | < 10ms | With index |
| DB batch insert (50 rows) | < 50ms | Transaction |

### Throughput

| Metric | Capacity | Notes |
|--------|----------|-------|
| Monitors | 1000+ | Per instance |
| Checks/hour | 12,000 | 1000 monitors × 12/hour |
| Concurrent checks | 3-5 | Sequential execution, Globalping limit 100req/s |
| Measurements/day | 86,400 | 1000 monitors × 24 location checks × 3.6checks/day |

### Resource Usage

| Resource | Typical | Peak |
|----------|---------|------|
| CPU | 5-10% idle | 40-50% during check batch |
| Memory | 80-120MB | 150-200MB (Node.js heap) |
| Disk | 50MB+ | 500MB+ (6 months data, 1000 monitors) |
| Network I/O | Minimal | 10-50Mbps during checks |

## Security Architecture

### Data Protection

1. **At Rest**:
   - SQLite file permissions: 0600 (user read/write only)
   - Database path: `.env` variable (not hardcoded)
   - Sensitive data: Encrypted environment variables

2. **In Transit**:
   - All external API calls: HTTPS only
   - Globalping API: Authenticated (API key, future)
   - Discord webhooks: HTTPS + secret validation

3. **In Application**:
   - SQL injection: Drizzle ORM parameterized queries
   - NoSQL injection: JSON parsing with validation
   - XSS: Svelte auto-escaping + Tailwind utility classes

### Access Control

**Current**: Single-user (self-hosted)
- No authentication layer (local network assumed)
- Future: JWT-based multi-user auth (Phase 05)

### Secret Management

```env
# .env (git-ignored)
DATABASE_URL=file:./data.db
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXX_SECRET
GLOBALPING_API_KEY=optional_future_key
```

**Best Practices**:
- Never commit `.env` to git (use `.env.example`)
- Use secrets management (GitHub Secrets, DockerHub Secrets)
- Rotate keys regularly

## Observability & Monitoring

### Logging

**Application Logs** (stdout/stderr):

```
[Database] Initialized with WAL mode and foreign keys enabled
[Cron] Scheduler initialized - checks every 5 minutes
[Cron] Starting monitor checks...
[Checker] Starting check for Production API (https://api.example.com)
[Globalping] Created measurement: jnhrklmn
[Globalping] Measurement jnhrklmn completed after 3 polls
[Checker] Stored 6 measurements for Production API
[Cron] Completed in 8234ms - Success: 5, Errors: 0
```

**Log Prefix Convention**: `[Component]` for easy filtering

### Metrics (Future)

**Phase 04+**: Prometheus-compatible metrics
- Monitor check duration
- API response time
- Database query time
- Error rates by component

### Health Checks

**Current**: Manual (POST /api/test-check)
**Future**:
- GET /api/health (scheduler status)
- GET /api/metrics (Prometheus)

## Scalability Roadmap

### Phase 03 (Current)
- Single instance, single-user
- SQLite embedded
- Sequential check execution

### Phase 04
- Multi-instance support (manual coordination)
- WebSocket for real-time updates
- Connection pooling

### Phase 05
- Leader-based scheduler coordination
- Multi-user with RBAC
- PostgreSQL option (scale-out database)

### Phase 06+
- Horizontal scaling (load balancer)
- Microservices (checker service, API service)
- Event streaming (Kafka for event sourcing)

---

**Architecture Review Date**: 2025-11-30
**Next Review**: Post Phase 04 Implementation
