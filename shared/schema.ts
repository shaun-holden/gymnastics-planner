import { pgTable, text, varchar, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Competitive Systems
export const COMPETITIVE_SYSTEMS = ["USA Gymnastics", "NGA", "AAU"] as const;
export type CompetitiveSystem = typeof COMPETITIVE_SYSTEMS[number];

// Events
export const EVENTS = ["Vault", "Bars", "Beam", "Floor"] as const;
export type Event = typeof EVENTS[number];

// Skill Values
export const SKILL_VALUES = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;
export type SkillValue = typeof SKILL_VALUES[number];

// Goal Timeframes
export const GOAL_TIMEFRAMES = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"] as const;
export type GoalTimeframe = typeof GOAL_TIMEFRAMES[number];

// Days of week
export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

// Skill value to numeric mapping for calculations
export const SKILL_VALUE_MAP: Record<SkillValue, number> = {
  A: 0.1,
  B: 0.2,
  C: 0.3,
  D: 0.4,
  E: 0.5,
  F: 0.6,
  G: 0.7,
  H: 0.8,
  I: 0.9,
};

// Athletes Table
export const athletes = pgTable("athletes", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  competitiveSystem: text("competitive_system").notNull(),
});

export const insertAthleteSchema = createInsertSchema(athletes).omit({ id: true });
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
export type Athlete = typeof athletes.$inferSelect;

// Skills Table
export const skills = pgTable("skills", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(), // A-I
  event: text("event").notNull(), // Vault, Bars, Beam, Floor
  description: text("description"),
});

export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// Practice Plans Table
export const practices = pgTable("practices", {
  id: varchar("id").primaryKey(),
  athleteId: varchar("athlete_id").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  vaultMinutes: integer("vault_minutes").default(0),
  barsMinutes: integer("bars_minutes").default(0),
  beamMinutes: integer("beam_minutes").default(0),
  floorMinutes: integer("floor_minutes").default(0),
  skillIds: text("skill_ids").array(), // Array of skill IDs assigned to this practice
});

export const insertPracticeSchema = createInsertSchema(practices).omit({ id: true });
export type InsertPractice = z.infer<typeof insertPracticeSchema>;
export type Practice = typeof practices.$inferSelect;

// Goals Table
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey(),
  athleteId: varchar("athlete_id"), // null for team goals
  title: text("title").notNull(),
  description: text("description"),
  timeframe: text("timeframe").notNull(), // Daily, Weekly, Monthly, Quarterly, Yearly
  linkedSkillIds: text("linked_skill_ids").array(),
  linkedEvent: text("linked_event"),
  completed: boolean("completed").default(false),
  progress: integer("progress").default(0), // 0-100
});

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Routines Table
export const routines = pgTable("routines", {
  id: varchar("id").primaryKey(),
  athleteId: varchar("athlete_id").notNull(),
  name: text("name").notNull(),
  event: text("event").notNull(),
  skillIds: text("skill_ids").array().notNull(), // Ordered array of skill IDs
  startValue: real("start_value").default(0),
  crFulfilled: boolean("cr_fulfilled").default(false),
  cvBonus: real("cv_bonus").default(0),
});

export const insertRoutineSchema = createInsertSchema(routines).omit({ id: true });
export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type Routine = typeof routines.$inferSelect;

// Users Table (for authentication if needed later)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Helper function to calculate start value
export function calculateStartValue(skills: Skill[]): { startValue: number; crFulfilled: boolean; cvBonus: number } {
  if (skills.length === 0) {
    return { startValue: 0, crFulfilled: false, cvBonus: 0 };
  }

  // Calculate difficulty value (DV) from skill values
  const difficultyValue = skills.reduce((sum, skill) => {
    return sum + (SKILL_VALUE_MAP[skill.value as SkillValue] || 0);
  }, 0);

  // CR (Composition Requirements) = 2.0 for elite routines
  // For simplicity, we'll assume CR is fulfilled if there are at least 4 different value skills
  const uniqueValues = new Set(skills.map(s => s.value));
  const crFulfilled = uniqueValues.size >= 4 && skills.length >= 6;
  const crValue = crFulfilled ? 2.0 : Math.min(uniqueValues.size * 0.5, 2.0);

  // CV (Connection Value) - bonus for connected skills
  // Simplified: give 0.1 bonus for each consecutive pair of C+ skills
  let cvBonus = 0;
  for (let i = 0; i < skills.length - 1; i++) {
    const currentValue = SKILL_VALUE_MAP[skills[i].value as SkillValue] || 0;
    const nextValue = SKILL_VALUE_MAP[skills[i + 1].value as SkillValue] || 0;
    if (currentValue >= 0.3 && nextValue >= 0.3) {
      cvBonus += 0.1;
    }
  }

  const startValue = difficultyValue + crValue + cvBonus;

  return {
    startValue: Math.round(startValue * 100) / 100,
    crFulfilled,
    cvBonus: Math.round(cvBonus * 100) / 100,
  };
}
