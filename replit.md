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
└── vite.ts

shared/
└── schema.ts        # Data models and types
```

## Core Features

### 1. Athletes
- Create/Edit/Delete athlete profiles
- Fields: name, level (1-10, Elite), competitive system (USA Gymnastics, NGA, AAU)

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
    - Composition Requirements (CR) = 2.0 when fulfilled
    - Connection Value (CV) bonus for consecutive C+ skills
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

## Future Enhancements
- Database persistence (PostgreSQL)
- Export to PDF/Excel/CSV/Word
- User authentication
- Multiple coaches/teams support
- Practice recommendations based on goals
