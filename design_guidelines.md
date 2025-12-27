# Gymnastics Training App - Design Guidelines

## Design Approach

**Selected Framework:** Material Design  
**Rationale:** This productivity application requires efficient data management, complex forms, and clear information hierarchy. Material Design excels at structured layouts, form interactions, and data-dense interfaces while maintaining visual clarity.

**Reference Applications:** Notion (organization), Asana (task management), Google Workspace (data handling)

---

## Typography System

**Primary Font:** Inter (via Google Fonts)  
**Secondary Font:** Roboto Mono (for numerical data, skill values, time displays)

**Hierarchy:**
- Page Headers: 32px, Semi-bold
- Section Headers: 24px, Semi-bold  
- Card/Component Headers: 18px, Medium
- Body Text: 16px, Regular
- Labels/Meta: 14px, Regular
- Data/Numbers: 16px Roboto Mono, Medium

---

## Layout System

**Spacing Units:** Tailwind 4, 6, 8, 12 for consistency (p-4, m-6, gap-8, py-12)

**Container Strategy:**
- Dashboard/Main Views: Full-width with max-w-7xl centered
- Forms/Editors: max-w-4xl for focused input
- Sidebars: Fixed 280px width

**Grid Patterns:**
- Athlete cards: 3-column grid (lg:grid-cols-3 md:grid-cols-2)
- Skill banks: 4-column dense grid for quick scanning
- Schedule views: Full-width time-block layouts

---

## Component Library

### Navigation
**Primary Navigation:** Left sidebar (fixed, full-height) with icon + label navigation
- Dashboard
- Athletes
- Practice Plans
- Skill Banks
- Routines
- Goals
- Reports

**Secondary Navigation:** Top bar with breadcrumbs, search, and user profile

### Dashboard Components
**Athlete Cards:** Compact cards showing name, level, next practice, active goals count. Include small avatar placeholder circle.

**Quick Stats Bar:** Horizontal metrics strip showing total athletes, this week's practices scheduled, pending goals, routines in progress.

**Recent Activity Feed:** Timeline-style list of recent actions (skill added, routine completed, goal achieved).

### Forms & Input
**Athlete Creation:** Multi-step card-based form with clear section divisions (Personal Info → Competitive Level → Initial Goals).

**Practice Planner:** Split-view layout:
- Left: Event selection with time sliders (15-min increments)
- Right: Live preview of schedule blocks with time allocation visualization

**Skill Bank Entry:** Modal overlay with structured fields (Event dropdown, Skill Name, Value selector A-I, Description textarea).

### Data Display
**Skill Bank View:** Filterable card grid organized by event with quick-action buttons (Add to Routine, Assign to Practice).

**Routine Builder:** Drag-and-drop interface:
- Left panel: Available skills from skill bank (filterable by value/event)
- Center: Sequence builder with skill blocks in order
- Right panel: Live start value calculator showing CR status, CV bonuses, total score

**Schedule Calendar:** Week-view grid showing practice blocks color-coded by event focus, with click-to-edit functionality.

### Goal Tracking
**Goal Cards:** Grouped by timeframe (Daily/Weekly/Monthly tabs) with progress indicators, linked skills list, and completion checkboxes.

**Progress Visualization:** Horizontal progress bars showing percentage complete, with milestone markers.

### Tables
**Athlete Roster Table:** Sortable columns (Name, Level, System, Active Goals, Last Practice), with row actions menu.

**Export Preview:** Data table matching export format with column selectors and format options (PDF/Excel/CSV/Word).

---

## Page Layouts

### Dashboard
Full-width hero stats bar, followed by 3-column layout: Recent Athletes (left), Today's Schedule (center), Upcoming Goals (right).

### Athlete Profile
Header card with athlete details and level badge, followed by tabbed sections: Practice History, Goals, Routines, Skill Progress.

### Practice Planner
Two-panel layout: Event time allocation controls (40% width), schedule visualization (60% width) with recommendation callouts.

### Routine Builder
Three-panel workspace: Skill library (25%), sequence builder (50%), calculator panel (25%).

---

## Interaction Patterns

**Drag & Drop:** Visual lift on grab, insertion guides when hovering drop zones, snap-to-grid positioning.

**Time Selection:** Slider controls with 15-minute snap points, total time counter updating live.

**Skill Selection:** Checkbox multi-select with batch actions toolbar appearing on selection.

**Inline Editing:** Click any editable field to transform into input, save on blur or Enter.

---

## Images & Assets

**Icons:** Material Icons (via CDN)  
**No Hero Image Required** - This is a dashboard application focused on productivity

**Avatar Placeholders:** Circle avatars with initials for athletes (use first/last name initials)

**Empty States:** Illustrated empty state graphics for:
- No athletes created yet (gymnast illustration)
- No skills in bank (vault/bars simple line art)
- No routines built (medal podium illustration)

---

## Accessibility

- All forms include visible labels positioned above inputs
- Color-independent status indicators (icons + text)
- Keyboard navigation for all interactive elements
- Focus visible states on all focusable components
- ARIA labels for icon-only buttons