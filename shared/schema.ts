import { pgTable, text, varchar, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth models for Replit Auth
export * from "./models/auth";

// Competitive Systems
export const COMPETITIVE_SYSTEMS = ["USA Gymnastics", "NGA", "AAU"] as const;
export type CompetitiveSystem = typeof COMPETITIVE_SYSTEMS[number];

// Events
export const EVENTS = ["Vault", "Bars", "Beam", "Floor"] as const;
export type Event = typeof EVENTS[number];

// Skill Values
export const SKILL_VALUES = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;
export type SkillValue = typeof SKILL_VALUES[number];

// Skill Groups by Event (4 groups per event for Bars, Beam, Floor)
export const BARS_GROUPS = ["Mounts", "Cast/Handstand", "Release Moves", "Dismounts"] as const;
export const BEAM_GROUPS = ["Mounts", "Acrobatic", "Dance/Leaps", "Dismounts"] as const;
export const FLOOR_GROUPS = ["Dance/Leaps", "Forward Tumbling", "Backward Tumbling", "Dismounts"] as const;

export type BarsGroup = typeof BARS_GROUPS[number];
export type BeamGroup = typeof BEAM_GROUPS[number];
export type FloorGroup = typeof FLOOR_GROUPS[number];
export type SkillGroup = BarsGroup | BeamGroup | FloorGroup;

export const SKILL_GROUPS_BY_EVENT: Record<string, readonly string[]> = {
  Bars: BARS_GROUPS,
  Beam: BEAM_GROUPS,
  Floor: FLOOR_GROUPS,
};

// Composition Requirements by Event (each worth 0.5, max 2.0)
export const BARS_CR = [
  { id: "hb_to_lb_flight", label: "Flight element from HB to LB" },
  { id: "same_bar_flight", label: "Flight element on the same bar" },
  { id: "different_grips", label: "Different grips (not cast, MT or DMT)" },
  { id: "non_flight_360_turn", label: "Non-flight element with min. 360° turn (not MT)" },
] as const;

export const BEAM_CR = [
  { id: "dance_connection", label: "Connection of 2+ dance elements (1 leap/jump with 180° split)" },
  { id: "turn_or_roll", label: "Turn (Gr. 3) or Roll/Flairs" },
  { id: "acro_series", label: "Acro series (min. 2 flight elements, 1 salto)" },
  { id: "acro_directions", label: "Acro elements in different directions (fwd/swd and bwd)" },
] as const;

export const FLOOR_CR = [
  { id: "dance_passage", label: "Dance passage (2 leaps/hops, 1 with 180° split)" },
  { id: "salto_la_turn", label: "Salto with LA turn (min. 360°)" },
  { id: "salto_double_ba", label: "Salto with double BA" },
  { id: "salto_bwd_fwd", label: "Salto bwd and salto fwd (no aerials) in same or different line" },
] as const;

export type BarsCR = typeof BARS_CR[number]["id"];
export type BeamCR = typeof BEAM_CR[number]["id"];
export type FloorCR = typeof FLOOR_CR[number]["id"];

export const CR_BY_EVENT: Record<string, readonly { id: string; label: string }[]> = {
  Bars: BARS_CR,
  Beam: BEAM_CR,
  Floor: FLOOR_CR,
};

// Goal Timeframes
export const GOAL_TIMEFRAMES = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"] as const;
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

// Connection Value (CV) Bonus Rules per Event (FIG Code of Points 2025-2028)
// Complete FIG-compliant CV rules for each apparatus

export const CV_RULES_BARS = [
  // Bars: Flight elements in series (releases, transitions)
  // FIG Code 2025-2028 connection bonuses
  { min1: "D", min2: "D", bonus: 0.1, label: "D+D" },
  { min1: "D", min2: "E", bonus: 0.2, label: "D+E" },
  { min1: "E", min2: "D", bonus: 0.2, label: "E+D" },
  { min1: "E", min2: "E", bonus: 0.2, label: "E+E" },
  { min1: "D", min2: "F", bonus: 0.2, label: "D+F" },
  { min1: "F", min2: "D", bonus: 0.2, label: "F+D" },
  { min1: "E", min2: "F", bonus: 0.2, label: "E+F" },
  { min1: "F", min2: "E", bonus: 0.2, label: "F+E" },
  { min1: "F", min2: "F", bonus: 0.2, label: "F+F" },
  { min1: "C", min2: "G", bonus: 0.2, label: "C+G" },
  { min1: "G", min2: "C", bonus: 0.2, label: "G+C" },
  { min1: "D", min2: "G", bonus: 0.2, label: "D+G" },
  { min1: "G", min2: "D", bonus: 0.2, label: "G+D" },
  { min1: "E", min2: "G", bonus: 0.2, label: "E+G" },
  { min1: "G", min2: "E", bonus: 0.2, label: "G+E" },
  { min1: "F", min2: "G", bonus: 0.2, label: "F+G" },
  { min1: "G", min2: "F", bonus: 0.2, label: "G+F" },
  { min1: "G", min2: "G", bonus: 0.2, label: "G+G" },
] as const;

export const CV_RULES_BEAM = [
  // Beam: Acrobatic and dance connections
  // FIG Code 2025-2028 connection bonuses
  // 0.1 bonus connections
  { min1: "B", min2: "B", bonus: 0.1, label: "B+B" },
  { min1: "B", min2: "C", bonus: 0.1, label: "B+C" },
  { min1: "C", min2: "B", bonus: 0.1, label: "C+B" },
  { min1: "B", min2: "D", bonus: 0.1, label: "B+D" },
  { min1: "D", min2: "B", bonus: 0.1, label: "D+B" },
  { min1: "C", min2: "C", bonus: 0.1, label: "C+C" },
  // 0.2 bonus connections
  { min1: "C", min2: "D", bonus: 0.2, label: "C+D" },
  { min1: "D", min2: "C", bonus: 0.2, label: "D+C" },
  { min1: "D", min2: "D", bonus: 0.2, label: "D+D" },
  { min1: "D", min2: "E", bonus: 0.2, label: "D+E" },
  { min1: "E", min2: "D", bonus: 0.2, label: "E+D" },
  { min1: "E", min2: "E", bonus: 0.2, label: "E+E" },
  { min1: "C", min2: "E", bonus: 0.2, label: "C+E" },
  { min1: "E", min2: "C", bonus: 0.2, label: "E+C" },
  { min1: "B", min2: "E", bonus: 0.2, label: "B+E" },
  { min1: "E", min2: "B", bonus: 0.2, label: "E+B" },
  { min1: "C", min2: "F", bonus: 0.2, label: "C+F" },
  { min1: "F", min2: "C", bonus: 0.2, label: "F+C" },
  { min1: "D", min2: "F", bonus: 0.2, label: "D+F" },
  { min1: "F", min2: "D", bonus: 0.2, label: "F+D" },
  { min1: "E", min2: "F", bonus: 0.2, label: "E+F" },
  { min1: "F", min2: "E", bonus: 0.2, label: "F+E" },
  { min1: "F", min2: "F", bonus: 0.2, label: "F+F" },
  { min1: "B", min2: "F", bonus: 0.2, label: "B+F" },
  { min1: "F", min2: "B", bonus: 0.2, label: "F+B" },
  { min1: "C", min2: "G", bonus: 0.2, label: "C+G" },
  { min1: "G", min2: "C", bonus: 0.2, label: "G+C" },
  { min1: "D", min2: "G", bonus: 0.2, label: "D+G" },
  { min1: "G", min2: "D", bonus: 0.2, label: "G+D" },
  { min1: "E", min2: "G", bonus: 0.2, label: "E+G" },
  { min1: "G", min2: "E", bonus: 0.2, label: "G+E" },
  { min1: "F", min2: "G", bonus: 0.2, label: "F+G" },
  { min1: "G", min2: "F", bonus: 0.2, label: "G+F" },
  { min1: "G", min2: "G", bonus: 0.2, label: "G+G" },
  { min1: "B", min2: "G", bonus: 0.2, label: "B+G" },
  { min1: "G", min2: "B", bonus: 0.2, label: "G+B" },
] as const;

export const CV_RULES_FLOOR = [
  // Floor: Direct acrobatic connections in tumbling lines
  // FIG Code 2025-2028 connection bonuses
  // 0.1 bonus connections
  { min1: "B", min2: "B", bonus: 0.1, label: "B+B" },
  { min1: "B", min2: "C", bonus: 0.1, label: "B+C" },
  { min1: "C", min2: "B", bonus: 0.1, label: "C+B" },
  { min1: "B", min2: "D", bonus: 0.1, label: "B+D" },
  { min1: "D", min2: "B", bonus: 0.1, label: "D+B" },
  { min1: "C", min2: "C", bonus: 0.1, label: "C+C" },
  // 0.2 bonus connections
  { min1: "C", min2: "D", bonus: 0.2, label: "C+D" },
  { min1: "D", min2: "C", bonus: 0.2, label: "D+C" },
  { min1: "D", min2: "D", bonus: 0.2, label: "D+D" },
  { min1: "D", min2: "E", bonus: 0.2, label: "D+E" },
  { min1: "E", min2: "D", bonus: 0.2, label: "E+D" },
  { min1: "E", min2: "E", bonus: 0.2, label: "E+E" },
  { min1: "C", min2: "E", bonus: 0.2, label: "C+E" },
  { min1: "E", min2: "C", bonus: 0.2, label: "E+C" },
  { min1: "B", min2: "E", bonus: 0.2, label: "B+E" },
  { min1: "E", min2: "B", bonus: 0.2, label: "E+B" },
  { min1: "C", min2: "F", bonus: 0.2, label: "C+F" },
  { min1: "F", min2: "C", bonus: 0.2, label: "F+C" },
  { min1: "D", min2: "F", bonus: 0.2, label: "D+F" },
  { min1: "F", min2: "D", bonus: 0.2, label: "F+D" },
  { min1: "E", min2: "F", bonus: 0.2, label: "E+F" },
  { min1: "F", min2: "E", bonus: 0.2, label: "F+E" },
  { min1: "F", min2: "F", bonus: 0.2, label: "F+F" },
  { min1: "B", min2: "F", bonus: 0.2, label: "B+F" },
  { min1: "F", min2: "B", bonus: 0.2, label: "F+B" },
  { min1: "C", min2: "G", bonus: 0.2, label: "C+G" },
  { min1: "G", min2: "C", bonus: 0.2, label: "G+C" },
  { min1: "D", min2: "G", bonus: 0.2, label: "D+G" },
  { min1: "G", min2: "D", bonus: 0.2, label: "G+D" },
  { min1: "E", min2: "G", bonus: 0.2, label: "E+G" },
  { min1: "G", min2: "E", bonus: 0.2, label: "G+E" },
  { min1: "F", min2: "G", bonus: 0.2, label: "F+G" },
  { min1: "G", min2: "F", bonus: 0.2, label: "G+F" },
  { min1: "G", min2: "G", bonus: 0.2, label: "G+G" },
  { min1: "B", min2: "G", bonus: 0.2, label: "B+G" },
  { min1: "G", min2: "B", bonus: 0.2, label: "G+B" },
] as const;

export type ConnectionInfo = {
  index: number;
  isConnected: boolean;
  bonus: number;
  label: string;
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
  value: text("value").notNull(), // A-I for Bars/Beam/Floor, or numeric string for Vault
  event: text("event").notNull(), // Vault, Bars, Beam, Floor
  description: text("description"),
  vaultValue: real("vault_value"), // Numeric value for vault skills (e.g., 10.0)
  skillGroup: text("skill_group"), // Group for Bars/Beam/Floor skills (null for Vault)
  crTags: text("cr_tags").array(), // Composition Requirement tags (for Bars, Beam, Floor)
});

export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// Get numeric value for a skill (handles both vault and apparatus)
export function getSkillNumericValue(skill: Skill): number {
  if (skill.event === "Vault" && skill.vaultValue !== null && skill.vaultValue !== undefined) {
    return skill.vaultValue;
  }
  return SKILL_VALUE_MAP[skill.value as SkillValue] || 0;
}

// Practice Target Types
export const PRACTICE_TARGET_TYPES = ["athletes", "level", "group", "all"] as const;
export type PracticeTargetType = typeof PRACTICE_TARGET_TYPES[number];

// Practice Plans Table
export const practices = pgTable("practices", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(), // Name of the practice plan
  description: text("description"), // What the plan is about
  targetType: text("target_type").notNull().default("all"), // athletes, level, group, all
  athleteIds: text("athlete_ids").array(), // Array of athlete IDs (when targetType is "athletes")
  levels: text("levels").array(), // Array of levels (when targetType is "level")
  groupName: text("group_name"), // Group name (when targetType is "group")
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
  timeframe: text("timeframe").notNull(), // Daily, Weekly, Monthly, Quarterly, Yearly, or Custom
  startDate: text("start_date"), // ISO date string for custom timeframe
  targetDate: text("target_date"), // ISO date string for custom timeframe
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
  crFulfilled: boolean("cr_fulfilled").default(false), // True when all 4 CR requirements are met
  cvBonus: real("cv_bonus").default(0),
  groupBonus: real("group_bonus").default(0), // 0.5 per group, max 2.0
  crBonus: real("cr_bonus").default(0), // 0.5 per CR, max 2.0
});

export const insertRoutineSchema = createInsertSchema(routines).omit({ id: true });
export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type Routine = typeof routines.$inferSelect;

// Curriculum Table
// Hierarchical structure: Program → Level → Event → Skill
// Timeline tracking: intro date, checkpoint, mastery target
export const CURRICULUM_STATUSES = ["Not Started", "Introduced", "In Progress", "Checkpoint", "Mastered"] as const;
export type CurriculumStatus = typeof CURRICULUM_STATUSES[number];

export const curriculum = pgTable("curriculum", {
  id: varchar("id").primaryKey(),
  program: text("program").notNull(), // e.g., "Competitive", "Recreational", "TOPS"
  level: text("level").notNull(), // e.g., "Level 4", "Level 5", etc.
  event: text("event").notNull(), // Vault, Bars, Beam, Floor
  skillId: varchar("skill_id").notNull(), // Reference to skills table
  athleteIds: text("athlete_ids").array(), // Array of athlete IDs for individual/group assignments (null = all athletes)
  introDate: text("intro_date"), // When skill should be introduced (ISO date string)
  checkpointDate: text("checkpoint_date"), // Progress checkpoint date
  masteryTargetDate: text("mastery_target_date"), // Target mastery date
  status: text("status").default("Not Started"), // Current status
  progress: integer("progress").default(0), // 0-100 percent
  notes: text("notes"), // Training notes
});

export const insertCurriculumSchema = createInsertSchema(curriculum).omit({ id: true });
export type InsertCurriculum = z.infer<typeof insertCurriculumSchema>;
export type Curriculum = typeof curriculum.$inferSelect;

// Users Table (for authentication if needed later)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Helper function to get CV bonus for a pair of skills based on event-specific rules
// Uses the CV_RULES constants to ensure FIG compliance
function getConnectionBonus(skill1: Skill, skill2: Skill, event: string): { bonus: number; label: string } {
  const val1 = skill1.value as SkillValue;
  const val2 = skill2.value as SkillValue;
  
  // Get the appropriate rules for the event
  let rules: readonly { min1: string; min2: string; bonus: number; label: string }[];
  if (event === "Bars") {
    rules = CV_RULES_BARS;
  } else if (event === "Beam") {
    rules = CV_RULES_BEAM;
  } else if (event === "Floor") {
    rules = CV_RULES_FLOOR;
  } else {
    return { bonus: 0, label: "" };
  }
  
  // Find the best matching rule (highest bonus first)
  // Sort rules by bonus descending to find best match
  const sortedRules = [...rules].sort((a, b) => b.bonus - a.bonus);
  
  for (const rule of sortedRules) {
    const minVal1 = SKILL_VALUE_MAP[rule.min1 as SkillValue] || 0;
    const minVal2 = SKILL_VALUE_MAP[rule.min2 as SkillValue] || 0;
    const skillVal1 = SKILL_VALUE_MAP[val1] || 0;
    const skillVal2 = SKILL_VALUE_MAP[val2] || 0;
    
    if (skillVal1 >= minVal1 && skillVal2 >= minVal2) {
      return { bonus: rule.bonus, label: rule.label };
    }
  }

  return { bonus: 0, label: "" };
}

// Calculate connections between skills in routine order
export function calculateConnections(skills: Skill[], event: string): ConnectionInfo[] {
  const connections: ConnectionInfo[] = [];
  
  if (event === "Vault" || skills.length < 2) {
    return connections;
  }

  for (let i = 0; i < skills.length - 1; i++) {
    const { bonus, label } = getConnectionBonus(skills[i], skills[i + 1], event);
    connections.push({
      index: i,
      isConnected: bonus > 0,
      bonus,
      label: bonus > 0 ? `+${bonus.toFixed(1)} (${label})` : "",
    });
  }

  return connections;
}

// Helper function to calculate start value
// For Vault: uses the vault's numeric value directly
// For Bars/Beam/Floor: counts only TOP 8 skills (highest values first)
// Group bonus: 0.5 per group represented (max 2.0 for all 4 groups)
// CR bonus: 0.5 per composition requirement met (max 2.0)
// CV bonus: FIG-compliant connection bonuses
export function calculateStartValue(skills: Skill[], event?: string): { 
  startValue: number; 
  crFulfilled: boolean; 
  cvBonus: number; 
  topSkills: Skill[];
  groupBonus: number;
  groupsPresent: string[];
  crBonus: number;
  crTagsPresent: string[];
  connections: ConnectionInfo[];
} {
  if (skills.length === 0) {
    return { startValue: 0, crFulfilled: false, cvBonus: 0, topSkills: [], groupBonus: 0, groupsPresent: [], crBonus: 0, crTagsPresent: [], connections: [] };
  }

  // For Vault, just return the vault value directly
  if (event === "Vault" || (skills.length > 0 && skills[0].event === "Vault")) {
    const vaultSkill = skills[0];
    const vaultValue = vaultSkill.vaultValue || 0;
    return {
      startValue: vaultValue,
      crFulfilled: false,
      cvBonus: 0,
      topSkills: skills,
      groupBonus: 0,
      groupsPresent: [],
      crBonus: 0,
      crTagsPresent: [],
      connections: [],
    };
  }

  const currentEvent = event || (skills.length > 0 ? skills[0].event : "");

  // For Bars/Beam/Floor: Sort by value and take top 8
  const sortedSkills = [...skills].sort((a, b) => {
    const valueA = SKILL_VALUE_MAP[a.value as SkillValue] || 0;
    const valueB = SKILL_VALUE_MAP[b.value as SkillValue] || 0;
    return valueB - valueA; // Descending order (highest first)
  });

  const topSkills = sortedSkills.slice(0, 8);

  // Calculate difficulty value (DV) from top 8 skills only
  const difficultyValue = topSkills.reduce((sum, skill) => {
    return sum + (SKILL_VALUE_MAP[skill.value as SkillValue] || 0);
  }, 0);

  // Group tracking (for display purposes only - not included in start value)
  const groupsPresent = Array.from(new Set(skills.filter(s => s.skillGroup).map(s => s.skillGroup!)));
  const groupBonus = 0; // Group bonus removed from calculation

  // CR bonus: Check which composition requirements are fulfilled for this event
  // 0.5 points per CR, max 2.0 (all 4 CRs) - applies to Bars, Beam, Floor
  const eventCRIds = (CR_BY_EVENT[currentEvent] || []).map(cr => cr.id);
  const allCrTags = skills.flatMap(s => s.crTags || []);
  const validCrTags = allCrTags.filter(tag => eventCRIds.includes(tag));
  const crTagsPresent = Array.from(new Set(validCrTags));
  const crBonus = Math.min(crTagsPresent.length * 0.5, 2.0);
  const crFulfilled = crTagsPresent.length >= 4;

  // CV (Connection Value) - FIG-compliant bonuses based on event
  // Use original skill order for connection value
  const connections = calculateConnections(skills, currentEvent);
  const cvBonus = connections.reduce((sum, conn) => sum + conn.bonus, 0);

  const startValue = difficultyValue + groupBonus + crBonus + cvBonus;

  return {
    startValue: Math.round(startValue * 100) / 100,
    crFulfilled,
    cvBonus: Math.round(cvBonus * 100) / 100,
    topSkills,
    groupBonus: Math.round(groupBonus * 100) / 100,
    groupsPresent,
    crBonus: Math.round(crBonus * 100) / 100,
    crTagsPresent,
    connections,
  };
}
