# Design Guidelines - GeoProbe

**Last Updated**: 2025-11-30
**Design System Version**: 1.0

## Design Philosophy

GeoProbe follows a **technical, clean, and data-first** design philosophy inspired by professional monitoring tools like Uptime Kuma. The interface prioritizes:

- **Information density** without clutter
- **Color with purpose** (status indicators only)
- **Dark theme optimization** for long monitoring sessions
- **Smooth micro-interactions** for professional feel
- **Accessible contrast ratios** (WCAG AA minimum)

## Color System

### Background Progression (Dark Theme)

```css
/* Layered backgrounds create depth perception */
--bg-darkest:     #1a1d21  /* Main app background */
--bg-chart:       #1c1f24  /* Chart/graph area */
--bg-sidebar:     #1e2228  /* Sidebar panel */
--bg-card:        #242830  /* Cards, modals */
--bg-input:       #2a2f38  /* Input fields, elevated elements */
--bg-border:      #2d3139  /* Subtle dividers */
--bg-hover:       #363b45  /* Hover states */
```

**Usage Pattern**: Each element sits on appropriate background layer. Inputs float above cards, cards float above sidebar, sidebar above main background.

### Text Colors

```css
--text-primary:   #e8eaed  /* Main content (14:1 contrast) */
--text-secondary: #9ca3af  /* Labels, descriptions (7:1 contrast) */
--text-muted:     #6b7280  /* Timestamps, hints (4.5:1 contrast) */
```

### Status Colors (Semantic)

```css
/* Tailwind-inspired palette */
--success:  #10b981  /* Emerald-500 - Up/Healthy */
--error:    #ef4444  /* Red-500 - Down/Failed */
--info:     #3b82f6  /* Blue-500 - Info, Datacenter */
--warning:  #f59e0b  /* Amber-500 - Warning, Degraded */
```

**Critical Rule**: Only use status colors for actual status. Never decorative.

### Interactive States

```css
--success-hover:  #0fd89e  /* Lighter emerald */
--success-active: #059669  /* Darker emerald */
--error-hover:    #dc2626  /* Darker red */
--error-active:   #b91c1c  /* Even darker red */
```

## Typography

### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Rationale**: Inter provides excellent legibility at small sizes, neutral technical feel, comprehensive character set.

### Type Scale

```css
--text-xs:   11px  /* Badges, tiny labels */
--text-sm:   12px  /* Small text, captions */
--text-base: 14px  /* Body text (DEFAULT) */
--text-md:   16px  /* Emphasized body, metric values */
--text-lg:   18px  /* Section headers */
--text-xl:   20px  /* Logo, large headers */
--text-2xl:  24px  /* Page sections */
--text-3xl:  32px  /* Page titles */
--text-4xl:  36px  /* Monitor detail title */
```

### Font Weights

```css
--weight-normal:    400  /* Regular body text */
--weight-medium:    500  /* Emphasized text */
--weight-semibold:  600  /* Headers, buttons, badges */
--weight-bold:      700  /* Logo, primary headings */
```

### Letter Spacing

```css
--tracking-tight:   -0.02em  /* Large headings */
--tracking-normal:   0em     /* Body text */
--tracking-wide:     0.01em  /* Labels, uppercase */
```

## Spacing System

### Base Unit: 4px

```css
--space-1:  4px   /* 0.25rem */
--space-2:  8px   /* 0.5rem */
--space-3:  12px  /* 0.75rem */
--space-4:  16px  /* 1rem */
--space-5:  20px  /* 1.25rem */
--space-6:  24px  /* 1.5rem */
--space-8:  32px  /* 2rem */
--space-10: 40px  /* 2.5rem */
--space-12: 48px  /* 3rem */
```

### Common Patterns

```css
/* Card padding */
padding: var(--space-6);  /* 24px */

/* Section gaps */
gap: var(--space-8);  /* 32px */

/* List item padding */
padding: var(--space-3) var(--space-4);  /* 12px 16px */

/* Button padding */
padding: var(--space-2) var(--space-5);  /* 8px 20px */
```

## Component Specifications

### Buttons

#### Primary Button (Call-to-Action)

```css
.btn-primary {
  background: var(--success);
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 150ms ease;
}

.btn-primary:hover {
  background: var(--success-hover);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.btn-primary:active {
  background: var(--success-active);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
}
```

#### Secondary Button (Ghost)

```css
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--bg-hover);
  transition: all 150ms ease;
}

.btn-secondary:hover {
  background: var(--bg-input);
  border-color: #4a5160;
  color: var(--text-primary);
}
```

#### Danger Button

```css
.btn-danger {
  background: var(--error);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  transition: all 150ms ease;
}

.btn-danger:hover {
  background: var(--error-hover);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
```

### Badges

#### Status Badge (Pill)

```css
.badge {
  padding: 4px 10px;
  border-radius: 12px;  /* 50% of height */
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.badge-success {
  background: var(--success);
  color: #ffffff;
}

.badge-error {
  background: var(--error);
  color: #ffffff;
}

.badge-info {
  background: var(--info);
  color: #ffffff;
}
```

### Cards

```css
.card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.card-flat {
  background: transparent;
  border-radius: 0;
  padding: 0;
}
```

### Input Fields

```css
.input {
  background: var(--bg-input);
  border: 1px solid var(--bg-hover);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 150ms ease;
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  outline: none;
  border-color: var(--success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
```

### Uptime Visualization Bars

```css
.uptime-bar {
  width: 12px;
  height: 40px;
  border-radius: 4px;
  transition: all 200ms ease;
  cursor: pointer;
}

.uptime-bar.up {
  background: var(--success);
}

.uptime-bar.down {
  background: var(--error);
}

.uptime-bar:hover {
  transform: scaleY(1.1);
  box-shadow: 0 0 12px currentColor;
}
```

**Implementation Notes**:
- 30 bars represent recent history
- Gap between bars: 4px
- Smooth hover animation (200ms ease)
- Tooltip shows timestamp on hover

## Layout Patterns

### Sidebar Layout

```css
.sidebar {
  width: 280px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--bg-border);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.main-content {
  margin-left: 280px;
  padding: var(--space-8) var(--space-10);
}
```

### Grid Systems

#### Metric Cards (5 columns)

```css
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-8);
}

@media (max-width: 1400px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

#### Location Cards (Responsive Grid)

```css
.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-4);
}
```

## Micro-Interactions

### Timing Standards

```css
/* Quick interactions */
--duration-fast: 150ms;  /* Hover, focus states */

/* Standard interactions */
--duration-base: 200ms;  /* Button clicks, toggles */

/* Emphasis interactions */
--duration-slow: 300ms;  /* Chart updates, modal open */

/* Data updates */
--duration-data: 500ms;  /* Number changes, loading */
```

### Easing Curves

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);      /* Entry animations */
--ease-in:  cubic-bezier(0.4, 0, 1, 1);      /* Exit animations */
--ease-both: cubic-bezier(0.4, 0, 0.2, 1);   /* Bidirectional */
```

**Usage**:
- Hover states: `transition: all 150ms ease;`
- Button clicks: `transition: transform 200ms var(--ease-out);`
- Modal open: `transition: opacity 300ms var(--ease-out);`
- Chart updates: `transition: all 500ms var(--ease-both);`

### Hover Effects

**Elevation Pattern**:
```css
/* Cards, buttons gain elevation on hover */
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
```

**Background Pattern**:
```css
/* List items, inputs change background */
background: var(--bg-hover);
```

## Accessibility

### Contrast Ratios (WCAG AA)

- **Primary text**: 14:1 (exceeds AAA)
- **Secondary text**: 7:1 (AAA for large text)
- **Muted text**: 4.5:1 (AA minimum)
- **Status indicators**: 4.5:1+ (on dark backgrounds)

### Focus Indicators

```css
.focusable:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  border-color: var(--success);
}
```

**Critical**: Never remove focus indicators without replacement.

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons, toggles
- **Escape**: Close modals, cancel actions
- **Arrow keys**: Navigate lists, adjust values
- **/**: Focus search input

## Multi-Location Features

### Location Selection Modal

**Design Pattern**: Full-screen modal with continent grid → country list → city selection.

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal-container {
  background: var(--bg-card);
  border-radius: 12px;
  max-width: 800px;
  max-height: 80vh;
}
```

### Location Badges

```css
.location-badge {
  background: var(--bg-input);
  border: 1px solid var(--bg-hover);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.network-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);  /* Green = Residential */
  /* or var(--info) */         /* Blue = Datacenter */
}
```

### Multi-Location Chart

**Color Assignment** (for location comparison):
```css
--location-1: #10b981;  /* Primary (Emerald) */
--location-2: #3b82f6;  /* Blue */
--location-3: #8b5cf6;  /* Violet */
--location-4: #f59e0b;  /* Amber */
--location-5: #ec4899;  /* Pink */
--location-6: #14b8a6;  /* Teal */
```

**Usage**: Assign colors sequentially to locations. Maximum 6 simultaneous comparisons recommended.

## Design Checklist

Before implementing new components:

- [ ] Uses approved color palette (no arbitrary colors)
- [ ] Typography follows scale (11px, 12px, 14px, 16px, 18px, etc.)
- [ ] Spacing uses 4px increments
- [ ] Border radius: 6-12px (no sharp corners)
- [ ] Hover states have 150-200ms transitions
- [ ] Focus indicators visible (3px ring, emerald color)
- [ ] Text contrast meets WCAG AA minimum
- [ ] Status colors used semantically only
- [ ] Responsive breakpoints tested (1400px, 1024px, 768px)
- [ ] Micro-interactions feel smooth and intentional

## Resources

**Figma Design File**: [Link when available]
**Tailwind Config**: `tailwind.config.ts`
**Component Library**: `src/lib/components/`
**Reference Screenshot**: `docs/image/img.png` (Uptime Kuma)

---

**Maintained by**: Design Team
**Questions**: Refer to Phase documents in `plans/20251130-0246-geoprobe-multi-location-ui/`
