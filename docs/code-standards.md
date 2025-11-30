# Code Standards & Guidelines - GeoProbe

**Version**: 1.0
**Date**: 2025-11-30
**Enforced By**: TypeScript (strict mode), ESLint (future), Pre-commit hooks (future)

## Core Principles

1. **Self-Documenting Code**: Clear function/variable names, minimal comments
2. **Strict Typing**: TypeScript strict mode, no `any` types
3. **Modular Architecture**: Single responsibility principle
4. **Performance First**: Optimize queries, minimize re-renders
5. **Security First**: Input validation, parameterized queries, HTTPS always

## TypeScript Standards

### Compiler Configuration

**tsconfig.json enforced settings**:
```json
{
  "compilerOptions": {
    "strict": true,                          // All strict options enabled
    "noUncheckedIndexedAccess": true,        // Check array/object access
    "noImplicitReturns": true,               // All paths must return
    "noFallthroughCasesInSwitch": true,      // Cases must break/return
    "esModuleInterop": true,                 // CommonJS interop
    "forceConsistentCasingInFileNames": true // Consistent file names
  }
}
```

### Type Definitions

#### Rule 1: No `any` Types
**FORBIDDEN**:
```typescript
// ❌ WRONG
function processData(data: any): any {
  return data.something;
}

const result: any = await fetch(url);
```

**CORRECT**:
```typescript
// ✓ RIGHT
interface DataPayload {
  something: string;
  value: number;
}

function processData(data: DataPayload): string {
  return data.something;
}

const result: Response = await fetch(url);
```

#### Rule 2: Explicit Return Types
**FORBIDDEN**:
```typescript
// ❌ WRONG - Return type inferred
const calculateUptime = (total: number, successful: number) => {
  return (successful / total) * 100;
};

// ❌ WRONG - No return type in exported functions
export function getMonitors() {
  return db.select().from(monitors);
}
```

**CORRECT**:
```typescript
// ✓ RIGHT
const calculateUptime = (total: number, successful: number): number => {
  return (successful / total) * 100;
};

// ✓ RIGHT
export function getMonitors(): Promise<Monitor[]> {
  return db.select().from(monitors);
}
```

#### Rule 3: Interface-First Design
**Pattern**:
```typescript
// Define props as interface
interface Props {
  monitor: Monitor;
  active: boolean;
  onclick: () => void;
}

// Use in component destructuring
const { monitor, active, onclick }: Props = $props();
```

#### Rule 4: Discriminated Unions for State
**FORBIDDEN**:
```typescript
// ❌ WRONG - Status can be any string
interface Result {
  status: string;
  data?: object;
  error?: string;
}
```

**CORRECT**:
```typescript
// ✓ RIGHT - Discriminated union (type-safe)
type Result =
  | { status: 'success'; data: object; error?: never }
  | { status: 'error'; error: string; data?: never }
  | { status: 'pending'; data?: never; error?: never };
```

## Svelte Components

### Naming Convention

| Category | Format | Example |
|----------|--------|---------|
| Components | PascalCase | `MonitorListItem.svelte` |
| Props interface | PascalCase + "Props" | `interface Props { ... }` |
| Event handlers | camelCase + "Handle" | `handlePause()`, `handleDelete()` |
| Stores | camelCase | `selectedMonitor`, `loading` |
| CSS classes | kebab-case | `monitor-item`, `uptime-bar` |

### Component Structure

**Template**:
```svelte
<script lang="ts">
  // 1. Import types and components
  import { type Snippet } from 'svelte';

  // 2. Define Props interface
  interface Props {
    title: string;
    children?: Snippet;
    onAction?: () => void;
  }

  // 3. Destructure props with $props()
  const { title, children, onAction }: Props = $props();

  // 4. Declare local state
  let count = $state(0);

  // 5. Derived state
  const doubled = $derived(count * 2);

  // 6. Define event handlers
  function handleIncrement(): void {
    count++;
  }

  // 7. Effects (rarely needed)
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>

<!-- 8. Template (no JavaScript) -->
<div class="container">
  <h1>{title}</h1>
  <button onclick={handleIncrement}>Count: {count}</button>
  <p>Doubled: {doubled}</p>
  {@render children?.()}
</div>

<!-- 9. Scoped styles (optional) -->
<style>
  .container {
    padding: 1rem;
  }
</style>
```

### Props Patterns

#### Snippet Children (Composition)
```svelte
<script lang="ts">
  import { type Snippet } from 'svelte';

  interface Props {
    title: string;
    children?: Snippet;
  }

  const { title, children }: Props = $props();
</script>

<div>
  <h2>{title}</h2>
  {@render children?.()}
</div>

<!-- Usage -->
<Card title="Monitor List">
  {#each monitors as monitor}
    <MonitorItem {monitor} />
  {/each}
</Card>
```

#### Optional Callbacks
```svelte
<script lang="ts">
  interface Props {
    onSave?: (data: FormData) => void;
    onCancel?: () => void;
  }

  const { onSave, onCancel }: Props = $props();

  function handleSubmit(e: SubmitEvent): void {
    const data = new FormData(e.currentTarget as HTMLFormElement);
    onSave?.(data);  // Optional chaining
  }
</script>

<form onsubmit={handleSubmit}>
  <!-- form fields -->
  <button type="button" onclick={() => onCancel?.()}>Cancel</button>
</form>
```

### State Management Rules

**Rule 1: Use $state() for Mutable State**
```svelte
<script lang="ts">
  // Single value
  let count = $state(0);

  // Object
  let form = $state({
    email: '',
    password: ''
  });

  // Array
  let items = $state<Monitor[]>([]);
</script>
```

**Rule 2: Use $derived for Computed State**
```svelte
<script lang="ts">
  let monitors = $state<Monitor[]>([]);

  // Reactive computation
  const activeCount = $derived(
    monitors.filter(m => m.active).length
  );

  // Expensive computation with memoization
  const sortedMonitors = $derived.by(() => {
    return monitors.slice().sort((a, b) => a.name.localeCompare(b.name));
  });
</script>
```

**Rule 3: Never Mutate Props**
```svelte
<script lang="ts">
  interface Props {
    monitor: Monitor;
  }

  const { monitor }: Props = $props();

  // ❌ WRONG - Mutating prop
  monitor.name = 'New Name';

  // ✓ RIGHT - Create copy or callback
  function handleNameChange(newName: string): void {
    // Send to parent or store
  }
</script>
```

## Server-Side Code

### File Organization

**Pattern**: One responsibility per file
```
src/lib/server/
├── db.ts              # Database connection & initialization
├── schema.ts          # Drizzle table definitions
├── checker.ts         # Monitor check logic
├── cron.ts            # Scheduler orchestration
└── globalping.ts      # External API client
```

### Database Queries

**Rule 1: Type-Safe Queries via Drizzle**
```typescript
// ✓ RIGHT - Drizzle ensures type safety
const activeMonitors = await db
  .select()
  .from(monitors)
  .where(eq(monitors.active, true));

// Result type: Monitor[]
```

**Rule 2: Index-Aware Queries**
```typescript
// ✓ RIGHT - Uses composite index (monitor_id, timestamp)
const recentMeasurements = await db
  .select()
  .from(measurements)
  .where(
    and(
      eq(measurements.monitorId, monitorId),
      gte(measurements.timestamp, thirtyDaysAgo)
    )
  )
  .orderBy(desc(measurements.timestamp))
  .limit(1000);
```

**Rule 3: Batch Operations for Performance**
```typescript
// ❌ WRONG - N+1 problem
for (const result of results) {
  await db.insert(measurements).values(result);
}

// ✓ RIGHT - Single batch insert
await db.insert(measurements).values(results);
```

### Error Handling

**Pattern: Explicit Error Types**
```typescript
type CheckResult =
  | { success: true; measurementCount: number }
  | { success: false; error: string };

export async function checkMonitor(monitor: Monitor): Promise<CheckResult> {
  try {
    const response = await runMeasurement({...});

    if (response.status === 'failed') {
      return { success: false, error: 'Measurement failed' };
    }

    const results = response.results ?? [];
    await db.insert(measurements).values(results);

    return { success: true, measurementCount: results.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
```

## API Routes

### Request Validation

**Pattern: Type-safe request bodies**
```typescript
// src/routes/api/monitors/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

interface CreateMonitorRequest {
  name: string;
  url: string;
  interval: number;
  locations: LocationFilter[];
}

export const POST: RequestHandler = async ({ request }) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate request shape (Phase 04: use zod)
  if (!isCreateMonitorRequest(body)) {
    return json({ error: 'Invalid request' }, { status: 400 });
  }

  // Process...
};

function isCreateMonitorRequest(val: unknown): val is CreateMonitorRequest {
  return (
    typeof val === 'object' &&
    val !== null &&
    'name' in val && typeof (val as any).name === 'string' &&
    'url' in val && typeof (val as any).url === 'string' &&
    'interval' in val && typeof (val as any).interval === 'number' &&
    'locations' in val && Array.isArray((val as any).locations)
  );
}
```

### Response Standardization

**Pattern: Consistent response format**
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

function errorResponse(error: string): ApiResponse {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString()
  };
}

export const POST: RequestHandler = async () => {
  try {
    const monitor = await createMonitor(...);
    return json(successResponse(monitor));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(errorResponse(message), { status: 500 });
  }
};
```

## Naming Conventions

### Variables & Constants

| Pattern | Example | Usage |
|---------|---------|-------|
| camelCase | `monitorList`, `isActive` | Variables, functions |
| UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` | Constants |
| Prefixed `is/has` | `isActive`, `hasError`, `canDelete` | Boolean flags |
| Prefixed `on` | `onSave`, `onError`, `onDelete` | Callbacks/events |
| Suffixed `Id` | `monitorId`, `measurementId` | IDs/keys |
| Suffixed `At` | `createdAt`, `updatedAt` | Timestamps |

### Files & Directories

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `Sidebar.svelte`, `MonitorListItem.svelte` |
| Routes | +prefix | `+page.svelte`, `+layout.svelte`, `+server.ts` |
| Utilities | camelCase | `utils.ts`, `helpers.ts` |
| Types | camelCase | `types.ts`, `globalping.ts` |
| Stores | camelCase | `monitorStore.ts`, `uiStore.ts` |

## Styling Standards

### Tailwind CSS Only

**Rule**: All styling via Tailwind utility classes
```svelte
<!-- ✓ RIGHT -->
<div class="flex items-center gap-3 rounded-lg bg-slate-700 p-4 hover:bg-slate-600">
  Content
</div>

<!-- ❌ WRONG - CSS files for component styling -->
<style>
  .container {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }
</style>
```

### Color System

**Dark theme colors defined in tailwind.config.ts**:
```typescript
colors: {
  'bg-darkest': '#1a1d21',    // Main background
  'bg-sidebar': '#1e2228',    // Sidebar
  'bg-card': '#242830',       // Cards/modals
  'bg-input': '#2a2f38',      // Inputs
  'bg-hover': '#363b45',      // Hover state
}
```

**Status colors**:
- Success: `text-emerald-500`, `bg-emerald-500` (#10b981)
- Error: `text-red-500`, `bg-red-500` (#ef4444)
- Info: `text-blue-500` (#3b82f6)
- Warning: `text-amber-500` (#f59e0b)

### Component Classes

**Button pattern**:
```svelte
<!-- Primary -->
<button class="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
  Button
</button>

<!-- Secondary -->
<button class="px-4 py-2 rounded-lg bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">
  Button
</button>

<!-- Danger -->
<button class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
  Delete
</button>
```

## Comments & Documentation

### When to Comment

**DO comment**:
- Complex algorithms (e.g., exponential backoff logic)
- Non-obvious business rules
- Workarounds for platform limitations
- Links to external references

**DON'T comment**:
- Self-explanatory code (use better naming instead)
- What code does (should be obvious from code)
- Outdated comments (delete them)

### Comment Format

```typescript
// Single line comment - Use for simple notes

/**
 * Multi-line JSDoc - Use for functions & exports
 * @param input - Description of parameter
 * @returns Description of return value
 * @throws Description of exceptions
 * @example
 * const result = myFunction('test');
 */
function myFunction(input: string): string {
  // Implementation
}

// TODO: Phase 04 - Add real-time updates via WebSocket
// FIXME: Performance issue with large datasets (>10k rows)
// NOTE: Globalping API has rate limit of 100req/s
```

## Git Commit Standards

### Commit Message Format

```
[scope]: Short description (50 chars max)

Longer description explaining the why and what.
- Bullet points for complex changes
- Reference issue/PR numbers

Fixes #123
```

**Scope prefixes**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code reorganization
- `style`: Formatting/styling only
- `test`: Test additions
- `docs`: Documentation
- `chore`: Build/dependency updates
- `perf`: Performance optimization

**Example**:
```
feat(components): Add UptimeBars component with 30-segment visualization

- Implement responsive bar chart
- Add hover tooltip with timestamp formatting
- Color-code status (up/down/unknown)
- Support custom data arrays

Completes Phase 03 dashboard
```

## Testing Standards (Phase 04+)

### Test Structure
```typescript
import { describe, it, expect } from 'vitest';
import { calculateUptime } from './uptime';

describe('calculateUptime', () => {
  it('should calculate 100% uptime for all successful checks', () => {
    const result = calculateUptime([
      { status: 'success' },
      { status: 'success' },
      { status: 'success' }
    ]);
    expect(result).toBe(100);
  });

  it('should calculate 50% uptime for mixed results', () => {
    const result = calculateUptime([
      { status: 'success' },
      { status: 'failed' }
    ]);
    expect(result).toBe(50);
  });

  it('should throw on empty array', () => {
    expect(() => calculateUptime([])).toThrow('No data provided');
  });
});
```

## Performance Guidelines

### Component Performance

**Rule 1: Avoid Expensive Computations in Templates**
```svelte
<!-- ❌ WRONG - Computes on every render -->
<p>{monitors.map(m => m.name).join(', ')}</p>

<!-- ✓ RIGHT - Computed once, cached -->
{@const monitorNames = monitors.map(m => m.name).join(', ')}
<p>{monitorNames}</p>

<!-- ✓ BETTER - Use $derived -->
const monitorNames = $derived(monitors.map(m => m.name).join(', '));
<p>{monitorNames}</p>
```

**Rule 2: Memoize Expensive Functions**
```typescript
const expensiveResult = $derived.by(() => {
  // Only recomputes when dependencies change
  return monitors.filter(m => m.active).sort((a, b) => a.name.localeCompare(b.name));
});
```

### Query Performance

**Rule 1: Use Indexes**
- Query on `(monitor_id, timestamp)` ✓ (indexed)
- Query on `status` ✗ (missing index)

**Rule 2: Batch Operations**
- Insert 1000 measurements in 1 query (not 1000 queries)

**Rule 3: Pagination**
- Fetch 100 records + cursor
- Load more on demand (not all at once)

## Accessibility Standards

### Semantic HTML

```svelte
<!-- ❌ WRONG - Non-semantic -->
<div onclick={handleClick} role="button">Click me</div>

<!-- ✓ RIGHT - Semantic -->
<button onclick={handleClick}>Click me</button>
```

### Color Contrast

**Requirement**: WCAG AA (4.5:1 minimum for text)

**Test**: Use contrast checker
```
Primary text (#e8eaed) on background (#1a1d21): 14:1 ✓
Secondary text (#9ca3af) on card (#242830): 7:1 ✓
Error text (#ef4444) on white: 3.13:1 ✗ (needs background)
```

### Focus States

```svelte
<!-- All interactive elements need focus indicator -->
<input class="focus:outline-none focus:ring-2 focus:ring-emerald-500" />
<button class="focus:outline-none focus:ring-2 focus:ring-emerald-500" />
```

## Review Checklist

Before committing code, verify:

- [ ] TypeScript strict mode (no `any` types)
- [ ] No console.log left in production code
- [ ] All props/functions have type annotations
- [ ] No hardcoded magic numbers/strings
- [ ] Component naming follows PascalCase
- [ ] Styling uses Tailwind only
- [ ] Error handling implemented
- [ ] Comments explain "why", not "what"
- [ ] No `// TODO` without issue reference
- [ ] Code follows self-documenting principle
- [ ] Tested locally (pnpm run dev)
- [ ] No security issues (SQL injection, XSS, etc.)

---

**Last Updated**: 2025-11-30
**Enforced Since**: Phase 03
**Next Review**: Post Phase 04
