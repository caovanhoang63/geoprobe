# GeoProbe Project Roadmap

**Document Date**: 2025-11-30
**Current Phase**: Phase 04 - Metrics & Visualization (Complete)
**Next Phase**: Phase 05 - Alert System & Advanced Features

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

### Phase 05: Alert System & Advanced Features ⏳ IN PLANNING
**Timeline**: 3-4 weeks (estimated)
**Priority**: High
**Status**: ○ PENDING

**Objectives**:
1. Alert channel integration (Discord, Slack, Telegram)
2. Advanced filtering and analytics
3. Multi-user support with authentication

**Deliverables** (Planned):
- [ ] Discord webhook integration
- [ ] Alert rules engine (down, latency spike, cert expiration)
- [ ] Quiet hours configuration
- [ ] Alert history & acknowledgment
- [ ] Slack/Telegram integration (Phase 05+)
- [ ] PagerDuty integration (Phase 05+)
- [ ] Database cleanup & retention policies
- [ ] Export functionality (JSON/CSV)

**Features**:
- Configurable alert thresholds
- Alert deduplication (don't spam)
- Multi-channel alerts
- Alert templates
- Integration with external systems

---

### Phase 06: Public Status Page ⏳ IN PLANNING
**Timeline**: 2-3 weeks (estimated)
**Priority**: Medium
**Status**: ○ PENDING

**Objectives**:
1. Public status page mode
2. Incident management
3. Component-based status

**Deliverables** (Planned):
- [ ] Public status page route (/status)
- [ ] Admin status page settings
- [ ] Component grouping (e.g., "API", "Web", "Database")
- [ ] Incident timeline display
- [ ] Historical uptime stats
- [ ] Custom branding

---

### Phase 07: Advanced Check Types ⏳ IN PLANNING
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

### Phase 08: Performance & Scaling ⏳ IN PLANNING
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

### Phase 09: Mobile App ⏳ IN PLANNING
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

### Phase 10: Community & Ecosystem ⏳ IN PLANNING
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
├─ Nov 30: Phase 03 ✓ Core Dashboard Complete
├─ Dec 7: Phase 04 ⏳ Metrics & Real-Time (Start)
│
2025-12
├─ Dec 21: Phase 04 ✓ Metrics & Real-Time Complete
├─ Dec 28: Phase 05 ⏳ Alert System (Start)
│
2026-01
├─ Jan 25: Phase 05 ✓ Alert System Complete
├─ Feb 1: Phase 06 ⏳ Status Page (Start)
│
2026-02
├─ Feb 21: Phase 06 ✓ Status Page Complete
├─ Feb 28: Phase 07 ⏳ Advanced Checks (Start)
│
2026-03
├─ Mar 28: Phase 07 ✓ Advanced Checks Complete
├─ Apr 4: Phase 08 ⏳ Performance & Scaling (Start)
│
2026-05
├─ May 30: Phase 08 ✓ Performance Complete
├─ Jun 6: Phase 09 ⏳ Mobile App (Start)
│
2026-08
├─ Aug 30: Phase 09 ✓ Mobile App Complete
├─ Sep 6: Phase 10 ⏳ Community & Ecosystem (Start)
│
2026-11
└─ Nov 30: Phase 10 ✓ Full Release Complete
```

## Dependency Map

```
Phase 01: Design & Planning
├─> Phase 02: Database Schema
    ├─> Phase 03: Core Dashboard ✓
        ├─> Phase 04: Metrics & Real-Time ⏳
        │   ├─> Phase 05: Alert System ⏳
        │   │   └─> Phase 06: Status Page ⏳
        │   │
        │   ├─> Phase 07: Advanced Checks ⏳
        │   │
        │   └─> Phase 08: Performance ⏳
        │       └─> Phase 09: Mobile App ⏳
        │
        └─> Phase 10: Community & Ecosystem ⏳
```

## Success Metrics

### Phase 03 (Current)
| Metric | Target | Status |
|--------|--------|--------|
| Components Created | 5 | ✓ 5/5 |
| Type Coverage | 100% | ✓ 100% |
| Line Coverage | 60%+ | ○ Pending tests |
| Design Fidelity | 95%+ | ✓ 95%+ |
| Documentation | Complete | ✓ 5 docs created |

### Phase 04 (Planned)
| Metric | Target | Notes |
|--------|--------|-------|
| Metrics Components | 3+ | Response chart, latency table, etc |
| Real-time Latency | < 1s | WebSocket or polling |
| CRUD Operations | 100% | Create/Read/Update/Delete |
| Test Coverage | 70%+ | Critical paths tested |
| Performance | < 2s load | SSR + cache optimization |

### Phase 05 (Planned)
| Metric | Target | Notes |
|--------|--------|-------|
| Alert Channels | 3+ | Discord, Slack, Telegram |
| False Positive Rate | < 2% | Intelligent alerting |
| Alert Delivery | < 30s | Near real-time |
| User Satisfaction | 4.5/5 | Community feedback |

## Risk Assessment

| Phase | Risk | Impact | Mitigation |
|-------|------|--------|-----------|
| 04 | Real-time complexity | High | Start with polling, upgrade to WebSocket |
| 05 | Alert spam | High | Deduplication, quiet hours |
| 06 | Public exposure | Medium | Authentication/rate limiting |
| 07 | API compatibility | Medium | Support multiple check types separately |
| 08 | Scaling challenges | High | PostgreSQL support, load testing |

## Resource Requirements

### Team
- **Phase 03**: 1 developer, 1 week ✓ COMPLETE
- **Phase 04**: 1 developer, 2-3 weeks (estimated)
- **Phase 05+**: 1-2 developers per phase

### Infrastructure
- Development: Local machine (SQLite)
- Testing: Docker containers
- CI/CD: GitHub Actions (Phase 05+)
- Monitoring: Project-managed (dogfooding)

## Known Limitations (Current)

- Single-user, single-instance (multi-user in Phase 05+)
- Scheduler not coordinated (duplicate checks if restarted)
- No real-time updates (polling only, WebSocket in Phase 04)
- No alerting (Discord integration in Phase 05)
- No mobile app (React Native in Phase 09)

## Backward Compatibility

**Commitment**: Database schema won't break between phases
- Migrations always additive (never delete columns)
- New features use new tables/columns
- API versioning (v1, v2) if breaking changes needed

## Community Contributions

**Opportunities for Contributors**:
- [ ] Phase 04: Chart library integration
- [ ] Phase 05: Slack/Telegram integrations
- [ ] Phase 06: Custom CSS for status page
- [ ] Phase 07: TCP/DNS check implementations
- [ ] Phase 09: React Native component library
- [ ] Phase 10: Plugin development

## Documentation Roadmap

| Phase | Documentation | Status |
|-------|---------------|--------|
| 03 | Codebase summary, Architecture, Standards, PDR | ✓ Complete |
| 04 | API documentation, Migration guide | ○ Pending |
| 05 | Alert configuration guide, Integration docs | ○ Pending |
| 06 | Status page customization guide | ○ Pending |
| 07 | Check type documentation | ○ Pending |
| 08 | Scaling & deployment guide | ○ Pending |
| 09 | Mobile app setup guide | ○ Pending |
| 10 | Plugin development guide | ○ Pending |

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
