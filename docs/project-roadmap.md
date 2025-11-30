# GeoProbe Project Roadmap

**Document Date**: 2025-11-30
**Current Phase**: Phase 09 - Public Status Page (Complete)
**Next Phase**: Phase 10 - Advanced Check Types

## Executive Summary

GeoProbe is progressing through phases to build a complete, self-hosted multi-location uptime monitoring solution. Each phase adds critical features while maintaining code quality and performance standards.

## Phase Overview

### Phase 01: Design & Planning ✓ COMPLETE
**Timeline**: Completed
**Status**: ✓ DONE

**Deliverables**:
- [x] UI/UX design (inspired by Uptime Kuma)
- [x] System architecture documentation
- [x] Database schema design
- [x] Component specifications
- [x] Technology stack finalized

**Output**: Design guidelines, prototype HTML, architecture diagrams

---

### Phase 02: Database Schema & Infrastructure ✓ COMPLETE
**Timeline**: Completed
**Status**: ✓ DONE

**Deliverables**:
- [x] SQLite schema with migrations
- [x] Drizzle ORM setup
- [x] Monitor & Measurement tables
- [x] Foreign key constraints & indexes
- [x] WAL mode configuration

**Key Components**:
- `src/lib/server/db.ts` - Database initialization
- `src/lib/server/schema.ts` - Drizzle ORM definitions
- `migrations/0000_*.sql` - Schema version control

**Technical Achievements**:
- Zero-config embedded database
- Type-safe queries via Drizzle
- Auto-migrations on startup
- Foreign key cascade delete
- Composite index for performance

---

### Phase 03: Core Dashboard Implementation ✓ COMPLETE
**Timeline**: Completed (2025-11-30)
**Status**: ✓ DONE

**Deliverables**:
- [x] Sidebar component (280px fixed nav)
- [x] MonitorListItem component (status badge + uptime)
- [x] UptimeBars component (30-segment visualization)
- [x] ActionButtons component (Pause/Edit/Delete)
- [x] Dashboard main layout (+page.svelte)
- [x] Background scheduler (node-cron, 5-min interval)
- [x] Globalping API client (async polling)
- [x] Monitor checker logic (measurement storage)
- [x] Type-safe implementation (no `any` types)
- [x] Dark theme with Tailwind CSS

**Key Components**:
- `src/lib/components/Sidebar.svelte`
- `src/lib/components/MonitorListItem.svelte`
- `src/lib/components/UptimeBars.svelte`
- `src/lib/components/ActionButtons.svelte`
- `src/routes/+page.svelte` (Dashboard)
- `src/lib/server/cron.ts` (Scheduler)
- `src/lib/server/checker.ts` (Check logic)
- `src/lib/server/globalping.ts` (API client)

**Technical Achievements**:
- Svelte 5 runes syntax (reactive state)
- Self-documenting component architecture
- Strict TypeScript throughout
- Graceful error handling
- Performance-optimized queries

**Documentation Created**:
- ✓ `docs/codebase-summary.md` (comprehensive overview)
- ✓ `docs/project-overview-pdr.md` (requirements & PDR)
- ✓ `docs/system-architecture.md` (detailed architecture)
- ✓ `docs/code-standards.md` (coding guidelines)
- ✓ `docs/design-guidelines.md` (design system)
- ✓ `docs/project-roadmap.md` (this file)

---

### Phase 04: Metrics Visualization & Real-Time Updates ✓ COMPLETE
**Timeline**: Completed (2025-11-30)
**Priority**: High
**Status**: ✓ DONE

**Objectives**:
1. ✅ Add metrics visualization (response time charts)
2. ✅ Multi-location latency comparison
3. ✅ Location selector component

**Deliverables**:
- [x] MetricCard component (4 variants)
- [x] MetricsGrid (5-column responsive)
- [x] ResponseChart (Chart.js with time range selector)
- [x] LocationLegend (toggleable visibility)
- [x] LocationSelectorModal (drill-down navigation)
- [x] LocationCard, LocationBadge components
- [x] NetworkToggle, LocationSearch
- [x] Mock location data (54 locations)
- [x] Dark theme chart configuration

**Created Components**:
- `src/lib/components/MetricCard.svelte`
- `src/lib/components/MetricsGrid.svelte`
- `src/lib/components/ResponseChart.svelte`
- `src/lib/components/LocationLegend.svelte`
- `src/lib/components/LocationSelector/*` (6 files)
- `src/lib/utils/chart-config.ts`
- `src/lib/types/location.ts`
- `src/lib/data/locations.ts`

**Technical Achievements**:
- Svelte 5 runes ($state, $derived, $effect)
- TypeScript strict mode (0 errors)
- Chart.js dark theme integration
- 54 mock locations (6 continents)
- Code review: APPROVED (90% criteria met)

---

### Phase 05: Monitor Configuration Form ✓ COMPLETE
**Timeline**: Completed (2025-11-30)
**Status**: ✓ DONE

**Deliverables**:
- [x] MonitorFormModal (create/edit modes)
- [x] UrlInput with real-time validation
- [x] IntervalSelector (6 presets)
- [x] LocationsField with LocationSelectorModal
- [x] NotificationSettings (Discord webhook)
- [x] DeleteConfirmModal
- [x] Full Zod validation

---

### Phase 06: API Routes & Database Integration ✓ COMPLETE
**Timeline**: Completed (2025-11-30)
**Status**: ✓ DONE

**Deliverables**:
- [x] GET/POST /api/monitors (list, create)
- [x] GET/PUT/DELETE /api/monitors/[id]
- [x] POST /api/monitors/[id]/pause
- [x] GET /api/measurements/[monitorId]
- [x] +page.server.ts with real data
- [x] Zod validation schemas
- [x] Type-safe monitor service

---

### Phase 07: Real-Time Updates ✓ COMPLETE
**Timeline**: Completed (2025-11-30)
**Status**: ✓ DONE

**Deliverables**:
- [x] Server-Sent Events (/api/events)
- [x] EventEmitter for server events
- [x] Svelte 5 realtime store
- [x] ConnectionStatus component
- [x] Auto-reconnect with backoff
- [x] Monitor state sync

---

### Phase 08: Alert System ✓ COMPLETE
**Timeline**: Completed (2025-11-30)
**Status**: ✓ DONE

**Deliverables**:
- [x] Alerts table in schema
- [x] Discord webhook integration
- [x] Alert rules (down detection)
- [x] Alert acknowledgment API
- [x] AlertBanner component
- [x] NotificationSettings integration

**Features**:
- Down detection alerts
- Discord webhook delivery
- Alert acknowledgment
- Real-time alert banner

---

### Phase 09: Public Status Page ✓ COMPLETE
**Timeline**: Completed (2025-11-30)
**Status**: ✓ DONE

**Deliverables**:
- [x] /status public route
- [x] StatusHeader (overall status)
- [x] StatusItem (per monitor)
- [x] UptimeGraph (90-day viz)
- [x] "public" field in monitors
- [x] Server-side data loading

---

### Phase 10: Advanced Check Types ⏳ IN PLANNING
**Timeline**: 3-4 weeks (estimated)
**Priority**: Medium
**Status**: ○ PENDING

**Objectives**:
1. Support TCP/Ping/DNS checks
2. SSL certificate monitoring
3. Custom check types

**Deliverables** (Planned):
- [ ] TCP port monitoring
- [ ] Ping latency checks
- [ ] DNS resolution monitoring
- [ ] SSL certificate expiration alerts
- [ ] Custom script execution
- [ ] Webhook-based custom checks

---

### Phase 11: Performance & Scaling ⏳ IN PLANNING
**Timeline**: 4-6 weeks (estimated)
**Priority**: Medium
**Status**: ○ PENDING

**Objectives**:
1. Horizontal scaling support
2. Leader-based scheduler coordination
3. Performance optimization

**Deliverables** (Planned):
- [ ] PostgreSQL support (alongside SQLite)
- [ ] Leader election for cron scheduling
- [ ] Connection pooling
- [ ] Query caching layer
- [ ] Metrics & monitoring (Prometheus)
- [ ] Database query optimization

---

### Phase 12: Mobile App ⏳ IN PLANNING
**Timeline**: 6-8 weeks (estimated)
**Priority**: Low
**Status**: ○ PENDING

**Objectives**:
1. Mobile monitoring app
2. Push notifications
3. On-the-go alerts

**Deliverables** (Planned):
- [ ] React Native iOS/Android app
- [ ] Firebase push notifications
- [ ] Mobile-optimized dashboard
- [ ] Offline support

---

### Phase 13: Community & Ecosystem ⏳ IN PLANNING
**Timeline**: 4-6 weeks (estimated)
**Priority**: Low
**Status**: ○ PENDING

**Objectives**:
1. Plugin ecosystem
2. Community contributions
3. Documentation & tutorials

**Deliverables** (Planned):
- [ ] Plugin system architecture
- [ ] Community plugin marketplace
- [ ] API documentation
- [ ] Integration templates
- [ ] Video tutorials
- [ ] Community forum/Discord

---

## Feature Timeline

```
2025-11
├─ Nov 30: Phase 01-09 ✓ All Core Features Complete
│   ├─ Design & Planning
│   ├─ Database Schema
│   ├─ Core Dashboard
│   ├─ Metrics & Visualization
│   ├─ Monitor Config Form
│   ├─ API Routes & CRUD
│   ├─ Real-time Updates (SSE)
│   ├─ Alert System (Discord)
│   └─ Public Status Page
│
2025-12+
├─ Phase 10 ⏳ Advanced Check Types
├─ Phase 11 ⏳ Performance & Scaling
├─ Phase 12 ⏳ Mobile App
└─ Phase 13 ⏳ Community & Ecosystem
```

## Dependency Map

```
Phase 01: Design & Planning ✓
├─> Phase 02: Database Schema ✓
    ├─> Phase 03: Core Dashboard ✓
        ├─> Phase 04: Metrics & Visualization ✓
            ├─> Phase 05: Monitor Config Form ✓
                ├─> Phase 06: API Routes & CRUD ✓
                    ├─> Phase 07: Real-time Updates ✓
                        ├─> Phase 08: Alert System ✓
                            └─> Phase 09: Status Page ✓
                                │
                                ├─> Phase 10: Advanced Checks ⏳
                                ├─> Phase 11: Performance ⏳
                                ├─> Phase 12: Mobile App ⏳
                                └─> Phase 13: Community ⏳
```

## Success Metrics

### Phases 01-09 (Complete)
| Metric | Target | Status |
|--------|--------|--------|
| Components Created | 30+ | ✓ Complete |
| Type Coverage | 100% | ✓ 100% (no `any`) |
| API Endpoints | 7 | ✓ All CRUD + events |
| Real-time | SSE | ✓ Implemented |
| Alert System | Discord | ✓ Webhooks working |
| Status Page | /status | ✓ Public route |

### Phase 10+ (Planned)
| Metric | Target | Notes |
|--------|--------|-------|
| Check Types | 4+ | TCP, Ping, DNS, SSL |
| Performance | < 2s load | SSR + caching |
| Mobile App | iOS/Android | React Native |

## Risk Assessment

| Phase | Risk | Impact | Mitigation |
|-------|------|--------|-----------|
| 10 | API compatibility | Medium | Check types as plugins |
| 11 | Scaling challenges | High | PostgreSQL support |
| 12 | Mobile complexity | Medium | Start with web PWA |
| 13 | Community adoption | Low | Strong documentation |

## Resource Requirements

### Team
- **Phase 01-09**: 1 developer ✓ COMPLETE
- **Phase 10+**: 1-2 developers per phase

### Infrastructure
- Development: Local machine (SQLite)
- Testing: Docker containers
- CI/CD: GitHub Actions
- Monitoring: Project-managed (dogfooding)

## Known Limitations (Current)

- Single-user, single-instance
- Scheduler not coordinated across instances
- HTTP checks only (TCP/Ping/DNS in Phase 10)
- No mobile app (Phase 12)

## Backward Compatibility

**Commitment**: Database schema won't break between phases
- Migrations always additive (never delete columns)
- New features use new tables/columns
- API versioning (v1, v2) if breaking changes needed

## Community Contributions

**Opportunities for Contributors**:
- [ ] Slack/Telegram integrations
- [ ] Custom CSS for status page
- [ ] TCP/DNS/Ping check implementations
- [ ] React Native component library
- [ ] Plugin development

## Documentation Roadmap

| Phase | Documentation | Status |
|-------|---------------|--------|
| 01-09 | Codebase summary, Architecture, Standards, PDR | ✓ Complete |
| 10 | Check type documentation | ○ Pending |
| 11 | Scaling & deployment guide | ○ Pending |
| 12 | Mobile app setup guide | ○ Pending |
| 13 | Plugin development guide | ○ Pending |

## Review Schedule

- **Monthly**: Phase progress review, team sync
- **Quarterly**: Roadmap adjustment, community feedback
- **Annually**: Major release planning, 5-year vision

## Unresolved Questions

1. PostgreSQL support - inline or separate phase?
2. Authentication method - JWT, OAuth, or admin key?
3. Mobile app approach - React Native or Flutter?
4. Monetization - open-source or SaaS tier?
5. Community platform - GitHub Discussions, Discord, or forum?

---

**Project Owner**: GeoProbe Team
**Last Updated**: 2025-11-30
**Next Milestone**: Phase 04 Kickoff
**Contact**: GitHub Issues
