# GeoProbe Multi-Location UI Design - Summary

**Created**: 2025-11-30 02:46
**Status**: ✅ Design Complete, Ready for Review

## Overview

Designed comprehensive UI for GeoProbe multi-location uptime monitor inspired by Uptime Kuma with enhanced geographic monitoring capabilities.

## Deliverables

sign
- **Files**:
  - `plan.md` - Project overview with phase links
  - `phase-01-design-analysis.md` - Uptime Kuma screenshot analysis
  - `phase-02-location-selector.md` - Multi-location component specs
  - `phase-03-dashboard-core.md` - Main dashboard layout specs
  - `phase-04-metrics-visualization.md` - Charts and metrics specs

### 2. Working Prototype
- **File**: `prototype-dashboard.html`
- **Features**:
  - ✅ Full dark theme matching Uptime Kuma aesthetic
  - ✅ Sidebar with monitor list and status badges
  - ✅ Uptime visualization bars (30 segments)
  - ✅ Metrics grid (Response time, Uptime %, Cert expiration)
  - ✅ Response time chart (SVG visualization)
  - ✅ Multi-location selector modal
  - ✅ Location badges with network indicators
  - ✅ Smooth animations (150-300ms transitions)
  - ✅ Responsive grid layouts

**To view**: Open `prototype-dashboard.html` in browser

### 3. Design System Documentation
- **File**: `docs/design-guidelines.md`
- **Sections**:
  - Color system (dark theme backgrounds, status colors)
  - Typography (Inter font, type scale, weights)
  - Spacing system (4px base unit)
  - Component specs (buttons, badges, cards, inputs)
  - Layout patterns (sidebar, grids)
  - Micro-interactions (timing, easing curves)
  - Accessibility standards (WCAG AA contrast)
  - Multi-location features (modal, badges, chart colors)

## Key Design Decisions

### Color Palette (Tailwind-Inspired)
```
Backgrounds: #1a1d21 → #363b45 (7-layer progression)
Success:     #10b981 (Emerald-500)
Error:       #ef4444 (Red-500)
Info:        #3b82f6 (Blue-500)
Warning:     #f59e0b (Amber-500)
```

### Typography
- **Font**: Inter (primary), fallback to system sans-serif
- **Base size**: 14px
- **Scale**: 11px (badges) → 36px (page titles)
- **Weights**: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)

### Multi-Location Differentiation
1. **Location Selector Modal**: Continent grid → country/city drill-down
2. **Network Indicators**: Green dot (residential), Blue dot (datacenter)
3. **Location Badges**: Removable chips showing selected locations
4. **Multi-Line Charts**: Up to 6 locations with distinct colors

### Component Highlights

**Uptime Bars**:
- 30 vertical bars (12px × 40px each)
- 4px gap between bars
- Green (up) / Red (down) colors
- Hover: scale + glow effect
- Tooltip on hover

**Status Badges**:
- Pill shape (border-radius: 12px)
- Font: 11px, weight 600
- Padding: 4px 10px
- Colors: Green (100%), Red (0%)

**Buttons**:
- Primary: Green, 8px radius, 150ms hover
- Secondary: Ghost style, 6px radius
- Danger: Red, subtle shadow

## Technical Specifications

### Layout
```
┌──────────┬────────────────────────────────┐
│          │  Monitor Detail (Title, URL)   │
│ Sidebar  ├────────────────────────────────┤
│          │  Uptime Bars + Status          │
│  280px   ├────────────────────────────────┤
│  Fixed   │  Metrics (5-column grid)       │
│          ├────────────────────────────────┤
│          │  Response Time Chart           │
└──────────┴────────────────────────────────┘
```

### Responsive Breakpoints
- **1400px**: Metrics grid → 3 columns
- **1024px**: Metrics grid → 2 columns
- **768px**: Sidebar collapses (future enhancement)

### Accessibility
- Primary text: 14:1 contrast (AAA)
- Secondary text: 7:1 contrast (AAA large)
- Focus indicators: 3px emerald ring
- Keyboard navigation: Tab, Enter, Escape, Arrow keys

## Implementation Notes

### Prototype → SvelteKit Migration
1. Convert HTML structure to `.svelte` components:
   - `Sidebar.svelte`
   - `MonitorList.svelte`
   - `UptimeBars.svelte`
   - `MetricsGrid.svelte`
   - `ResponseChart.svelte`
   - `LocationSelector.svelte`

2. Replace inline styles with Tailwind classes:
   - Create `tailwind.config.ts` with custom theme
   - Use `@apply` for component patterns
   - Maintain exact color/spacing values

3. Add state management:
   - Svelte stores for monitor data
   - Reactive statements for uptime calculations
   - API integration with Globalping

4. Enhance with Svelte features:
   - Transitions (fade, slide, scale)
   - Animations (tweened values for metrics)
   - Reactive charts (update on data change)

### Chart Library Recommendation
Use **Chart.js** or **Apache ECharts** for response time visualization:
- Both support dark themes
- Smooth animations
- Multi-line datasets (for location comparison)
- Responsive/accessible
- Lightweight

### Location Data Structure
```typescript
interface Location {
  id: string
  continent: string
  country: string
  city: string
  networkType: 'residential' | 'datacenter'
  isp?: string
}

interface SelectedLocation {
  location: Location
  color: string  // Assigned from palette
}
```

## Next Steps for Development

1. **Integrate with Globalping API**:
   - Fetch available probe locations
   - Map to continent/country/city structure
   - Filter by network type

2. **Implement SvelteKit Routes**:
   - `/` - Dashboard (monitor list)
   - `/monitor/[id]` - Monitor detail view
   - `/monitor/new` - Create monitor form
   - `/monitor/[id]/edit` - Edit monitor

3. **Add Real-Time Updates**:
   - WebSocket or polling for live status
   - Smooth chart updates (500ms transition)
   - Toast notifications for status changes

4. **Database Integration**:
   - Store monitor configurations (SQLite via Drizzle)
   - Save historical response times
   - Track uptime percentage calculations

5. **Testing**:
   - Visual regression tests (screenshot comparison)
   - Accessibility audit (axe-core)
   - Performance testing (Lighthouse)
   - Cross-browser compatibility

## Files Structure

```
globalping-ui/
├── prototype-dashboard.html          # Standalone HTML prototype
├── plans/
│   └── 20251130-0246-geoprobe-multi-location-ui/
│       ├── plan.md                   # Overview
│       ├── phase-01-design-analysis.md
│       ├── phase-02-location-selector.md
│       ├── phase-03-dashboard-core.md
│       └── phase-04-metrics-visualization.md
├── docs/
│   ├── design-guidelines.md          # Complete design system
│   └── image/
│       └── img.png                   # Uptime Kuma reference
└── DESIGN_SUMMARY.md                 # This file
```

## Review Checklist

Before proceeding to implementation:

- [x] Design matches Uptime Kuma aesthetic quality
- [x] Multi-location features clearly differentiated
- [x] Color palette follows Tailwind conventions
- [x] Typography system is consistent
- [x] Spacing uses 4px increments
- [x] All components have hover states
- [x] Accessibility standards met (WCAG AA)
- [x] Responsive breakpoints defined
- [x] Micro-interactions documented (timing, easing)
- [x] Implementation path clear (Svelte components)

## Questions?

Review detailed specifications in:
- **Design System**: `docs/design-guidelines.md`
- **Implementation Plans**: `plans/20251130-0246-geoprobe-multi-location-ui/*.md`
- **Working Prototype**: `prototype-dashboard.html`

---

**Design Status**: ✅ Complete and Ready for Implementation
**Estimated Implementation Time**: 2-3 development sprints
**Priority**: High (Core product differentiator)
