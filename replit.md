# GymnasticsPlanner - Lesson Planning & Training Management App

## Overview
A comprehensive gymnastics lesson planning and training management application designed for competitive gymnastics programs. The app supports individualized and group planning, skill tracking, goal setting, and routine construction with automatic start value calculation.

## Current State
- **MVP Complete**: Core features implemented and working
- **Data Storage**: In-memory storage (data resets on server restart)
- **Authentication**: Not implemented (single user mode)

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/           # Shadcn UI components
│   │   ├── app-sidebar.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/
│   │   ├── dashboard.tsx    # Main stats overview
│   │   ├── athletes.tsx     # Athlete management
│   │   ├── skills.tsx       # Skill bank by event
│   │   ├── practices.tsx    # Practice planning
│   │   ├── routines.tsx     # Routine builder
│   │   └── goals.tsx        # Goal tracking
│   ├── App.tsx
│   └── index.css
├── lib/
│   └── queryClient.ts

server/
├── index.ts         # Express server entry
├── routes.ts        # API endpoints
├── storage.ts       # In-memory data storage
├── seed-skills.ts   # FIG Code of Points 2025-2028 skill data (329 skills)
└── vite.ts

shared/
└── schema.ts        # Data models and types
```

## Core Features

### 1. Athletes
- Create/Edit/Delete athlete profiles
- Fields: name, level, competitive system (USA Gymnastics, NGA, AAU)
- Levels vary by system:
  - USA Gymnastics: 1-10, TOPS, HOPES 11-12, HOPES 13-14, Jr. Elite, Elite, Xcel Bronze/Silver/Gold/Platinum/Diamond/Sapphire
  - NGA: 1-10, Bronze, Silver, Gold, Platinum, Diamond, Sapphire
  - AAU: 1-10, Bronze, Silver, Gold, Platinum, Diamond, Sapphire

### 2. Skill Bank
- Organize skills by event: Vault, Bars, Beam, Floor
- Vault skills: Use numeric start values (e.g., 10.0, 9.8)
- Bars/Beam/Floor skills: Use A-I letter values (0.1 - 0.9)
- Search and filter capabilities

### 3. Practice Planning
- Create practice plans for any day of the week
- Time allocation in 15-minute increments per event
- Visual time distribution bars

### 4. Routine Builder
- Build competitive routines from skill bank
- Automatic Start Value calculation:
  - **Vault**: Uses direct numeric vault value
  - **Bars/Beam/Floor**: Counts only TOP 8 skills (highest values first)
    - Difficulty Value (DV) from top 8 skill values
    - Group Bonus = 0.5 per group (max 2.0 for all 4 groups)
      - Bars groups: Mounts, Cast/Handstand, Release Moves, Dismounts
      - Beam groups: Mounts, Acrobatic, Dance/Leaps, Dismounts
      - Floor groups: Dance/Leaps, Forward Tumbling, Backward Tumbling, Dismounts
    - **Composition Requirements (CR)** = 0.5 per requirement (max 2.0)
      - **Bars**: Flight HB to LB, Flight same bar, Different grips, Non-flight 360° turn
      - **Beam**: Dance connection (2+ elements, 1 with 180° split), Turn/Roll/Flairs, Acro series (2 flight, 1 salto), Acro in different directions
      - **Floor**: Dance passage (2 leaps/hops, 1 with 180° split), Salto with LA turn (360°+), Salto with double BA, Salto bwd and fwd (no aerials)
    - **Connection Value (CV)** = FIG-compliant bonuses for skill connections
      - **Bars**: D+D=0.1, D+E/E+D/E+E=0.2
      - **Beam/Floor**: B+C/C+B=0.1, C+C=0.1, C+D/D+C/D+D/D+E/E+D/E+E=0.2
    - Visual connection indicators (link icons) between connected skills
- Live preview of start value while building

### 5. Goals
- Individual athlete or team-wide goals
- Timeframes: Daily, Weekly, Monthly, Quarterly, Yearly
- Progress tracking with slider (0-100%)
- Link goals to specific events

## Tech Stack
- **Frontend**: React, TypeScript, TanStack Query, Wouter, Tailwind CSS
- **UI Components**: Shadcn/ui, Radix primitives
- **Backend**: Express.js, Node.js
- **Styling**: Tailwind CSS with custom design tokens
- **Fonts**: Inter (primary), Roboto Mono (numerical data)

## API Endpoints

### Athletes
- `GET /api/athletes` - List all athletes
- `POST /api/athletes` - Create athlete
- `PATCH /api/athletes/:id` - Update athlete
- `DELETE /api/athletes/:id` - Delete athlete

### Skills
- `GET /api/skills` - List all skills
- `POST /api/skills` - Create skill
- `PATCH /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Practices
- `GET /api/practices` - List all practices
- `POST /api/practices` - Create practice
- `PATCH /api/practices/:id` - Update practice
- `DELETE /api/practices/:id` - Delete practice

### Goals
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Routines
- `GET /api/routines` - List all routines
- `POST /api/routines` - Create routine
- `PATCH /api/routines/:id` - Update routine
- `DELETE /api/routines/:id` - Delete routine

## Running the App
```bash
npm run dev
```
The app runs on port 5000.

## Recent Changes
- Initial MVP implementation (Dec 27, 2025)
- Dashboard with stats overview
- Full CRUD for Athletes, Skills, Practices, Goals, Routines
- Start Value calculator for Elite routines
- Dark/Light theme toggle
- Successfully imported 329 skills from FIG Code of Points 2025-2028: 61 Vault, 73 Bars, 105 Beam, 90 Floor
- Created seed-skills.ts with comprehensive skill data including proper values, groups, and CR tags
- Implemented automatic skill seeding on server startup with duplicate prevention

## Future Enhancements
- Database persistence (PostgreSQL)
- Export to PDF/Excel/CSV/Word
- User authentication
- Multiple coaches/teams support
- Practice recommendations based on goals
