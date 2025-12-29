import {
  type Athlete,
  type InsertAthlete,
  type Skill,
  type InsertSkill,
  type Practice,
  type InsertPractice,
  type Goal,
  type InsertGoal,
  type Routine,
  type InsertRoutine,
  type User,
  type InsertUser,
  athletes,
  skills,
  practices,
  goals,
  routines,
  users,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { allSkills } from "./seed-skills";

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Athletes
  getAthletes(): Promise<Athlete[]>;
  getAthlete(id: string): Promise<Athlete | undefined>;
  createAthlete(athlete: InsertAthlete): Promise<Athlete>;
  updateAthlete(id: string, athlete: Partial<InsertAthlete>): Promise<Athlete | undefined>;
  deleteAthlete(id: string): Promise<boolean>;

  // Skills
  getSkills(): Promise<Skill[]>;
  getSkill(id: string): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: string, skill: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: string): Promise<boolean>;
  seedSkills(): Promise<void>;

  // Practices
  getPractices(): Promise<Practice[]>;
  getPractice(id: string): Promise<Practice | undefined>;
  createPractice(practice: InsertPractice): Promise<Practice>;
  updatePractice(id: string, practice: Partial<InsertPractice>): Promise<Practice | undefined>;
  deletePractice(id: string): Promise<boolean>;

  // Goals
  getGoals(): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;

  // Routines
  getRoutines(): Promise<Routine[]>;
  getRoutine(id: string): Promise<Routine | undefined>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  updateRoutine(id: string, routine: Partial<InsertRoutine>): Promise<Routine | undefined>;
  deleteRoutine(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db.insert(users).values({ ...insertUser, id }).returning();
    return user;
  }

  // Athletes
  async getAthletes(): Promise<Athlete[]> {
    return await db.select().from(athletes);
  }

  async getAthlete(id: string): Promise<Athlete | undefined> {
    const [athlete] = await db.select().from(athletes).where(eq(athletes.id, id));
    return athlete || undefined;
  }

  async createAthlete(insertAthlete: InsertAthlete): Promise<Athlete> {
    const id = randomUUID();
    const [athlete] = await db.insert(athletes).values({ ...insertAthlete, id }).returning();
    return athlete;
  }

  async updateAthlete(id: string, data: Partial<InsertAthlete>): Promise<Athlete | undefined> {
    const sanitized = stripUndefined(data);
    if (Object.keys(sanitized).length === 0) return this.getAthlete(id);
    const [updated] = await db.update(athletes).set(sanitized).where(eq(athletes.id, id)).returning();
    return updated || undefined;
  }

  async deleteAthlete(id: string): Promise<boolean> {
    const result = await db.delete(athletes).where(eq(athletes.id, id)).returning();
    return result.length > 0;
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }

  async getSkill(id: string): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = randomUUID();
    const [skill] = await db.insert(skills).values({
      ...insertSkill,
      id,
      description: insertSkill.description || null,
      vaultValue: insertSkill.vaultValue ?? null,
      skillGroup: insertSkill.skillGroup ?? null,
      crTags: insertSkill.crTags ?? null,
    }).returning();
    return skill;
  }

  async updateSkill(id: string, data: Partial<InsertSkill>): Promise<Skill | undefined> {
    const sanitized = stripUndefined(data);
    if (Object.keys(sanitized).length === 0) return this.getSkill(id);
    const [updated] = await db.update(skills).set(sanitized).where(eq(skills.id, id)).returning();
    return updated || undefined;
  }

  async deleteSkill(id: string): Promise<boolean> {
    const result = await db.delete(skills).where(eq(skills.id, id)).returning();
    return result.length > 0;
  }

  async seedSkills(): Promise<void> {
    const existingSkills = await db.select().from(skills);
    if (existingSkills.length > 0) {
      console.log(`Database already has ${existingSkills.length} skills, skipping seed.`);
      return;
    }

    console.log("Seeding skills from FIG Code of Points 2025-2028...");
    for (const insertSkill of allSkills) {
      const id = randomUUID();
      await db.insert(skills).values({
        ...insertSkill,
        id,
        description: insertSkill.description || null,
        vaultValue: insertSkill.vaultValue ?? null,
        skillGroup: insertSkill.skillGroup ?? null,
        crTags: insertSkill.crTags ?? null,
      });
    }
    console.log(`Seeded ${allSkills.length} skills from FIG Code of Points 2025-2028`);
  }

  // Practices
  async getPractices(): Promise<Practice[]> {
    return await db.select().from(practices);
  }

  async getPractice(id: string): Promise<Practice | undefined> {
    const [practice] = await db.select().from(practices).where(eq(practices.id, id));
    return practice || undefined;
  }

  async createPractice(insertPractice: InsertPractice): Promise<Practice> {
    const id = randomUUID();
    const [practice] = await db.insert(practices).values({
      ...insertPractice,
      id,
      vaultMinutes: insertPractice.vaultMinutes || 0,
      barsMinutes: insertPractice.barsMinutes || 0,
      beamMinutes: insertPractice.beamMinutes || 0,
      floorMinutes: insertPractice.floorMinutes || 0,
      skillIds: insertPractice.skillIds || null,
    }).returning();
    return practice;
  }

  async updatePractice(id: string, data: Partial<InsertPractice>): Promise<Practice | undefined> {
    const sanitized = stripUndefined(data);
    if (Object.keys(sanitized).length === 0) return this.getPractice(id);
    const [updated] = await db.update(practices).set(sanitized).where(eq(practices.id, id)).returning();
    return updated || undefined;
  }

  async deletePractice(id: string): Promise<boolean> {
    const result = await db.delete(practices).where(eq(practices.id, id)).returning();
    return result.length > 0;
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return await db.select().from(goals);
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const [goal] = await db.insert(goals).values({
      ...insertGoal,
      id,
      athleteId: insertGoal.athleteId || null,
      description: insertGoal.description || null,
      linkedSkillIds: insertGoal.linkedSkillIds || null,
      linkedEvent: insertGoal.linkedEvent || null,
      completed: insertGoal.completed || false,
      progress: insertGoal.progress || 0,
    }).returning();
    return goal;
  }

  async updateGoal(id: string, data: Partial<InsertGoal>): Promise<Goal | undefined> {
    const sanitized = stripUndefined(data);
    if (Object.keys(sanitized).length === 0) return this.getGoal(id);
    const [updated] = await db.update(goals).set(sanitized).where(eq(goals.id, id)).returning();
    return updated || undefined;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id)).returning();
    return result.length > 0;
  }

  // Routines
  async getRoutines(): Promise<Routine[]> {
    return await db.select().from(routines);
  }

  async getRoutine(id: string): Promise<Routine | undefined> {
    const [routine] = await db.select().from(routines).where(eq(routines.id, id));
    return routine || undefined;
  }

  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const id = randomUUID();
    const [routine] = await db.insert(routines).values({
      ...insertRoutine,
      id,
      startValue: insertRoutine.startValue || 0,
      crFulfilled: insertRoutine.crFulfilled || false,
      cvBonus: insertRoutine.cvBonus || 0,
      groupBonus: insertRoutine.groupBonus || 0,
      crBonus: insertRoutine.crBonus || 0,
    }).returning();
    return routine;
  }

  async updateRoutine(id: string, data: Partial<InsertRoutine>): Promise<Routine | undefined> {
    const sanitized = stripUndefined(data);
    if (Object.keys(sanitized).length === 0) return this.getRoutine(id);
    const [updated] = await db.update(routines).set(sanitized).where(eq(routines.id, id)).returning();
    return updated || undefined;
  }

  async deleteRoutine(id: string): Promise<boolean> {
    const result = await db.delete(routines).where(eq(routines.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
