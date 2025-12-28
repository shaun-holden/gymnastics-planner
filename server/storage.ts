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
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private athletes: Map<string, Athlete>;
  private skills: Map<string, Skill>;
  private practices: Map<string, Practice>;
  private goals: Map<string, Goal>;
  private routines: Map<string, Routine>;

  constructor() {
    this.users = new Map();
    this.athletes = new Map();
    this.skills = new Map();
    this.practices = new Map();
    this.goals = new Map();
    this.routines = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Athletes
  async getAthletes(): Promise<Athlete[]> {
    return Array.from(this.athletes.values());
  }

  async getAthlete(id: string): Promise<Athlete | undefined> {
    return this.athletes.get(id);
  }

  async createAthlete(insertAthlete: InsertAthlete): Promise<Athlete> {
    const id = randomUUID();
    const athlete: Athlete = { ...insertAthlete, id };
    this.athletes.set(id, athlete);
    return athlete;
  }

  async updateAthlete(id: string, data: Partial<InsertAthlete>): Promise<Athlete | undefined> {
    const existing = this.athletes.get(id);
    if (!existing) return undefined;
    const updated: Athlete = { ...existing, ...data };
    this.athletes.set(id, updated);
    return updated;
  }

  async deleteAthlete(id: string): Promise<boolean> {
    return this.athletes.delete(id);
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }

  async getSkill(id: string): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = randomUUID();
    const skill: Skill = {
      ...insertSkill,
      id,
      description: insertSkill.description || null,
      vaultValue: insertSkill.vaultValue ?? null,
      skillGroup: insertSkill.skillGroup ?? null,
      crTags: insertSkill.crTags ?? null,
    };
    this.skills.set(id, skill);
    return skill;
  }

  async updateSkill(id: string, data: Partial<InsertSkill>): Promise<Skill | undefined> {
    const existing = this.skills.get(id);
    if (!existing) return undefined;
    const updated: Skill = { ...existing, ...data };
    this.skills.set(id, updated);
    return updated;
  }

  async deleteSkill(id: string): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Practices
  async getPractices(): Promise<Practice[]> {
    return Array.from(this.practices.values());
  }

  async getPractice(id: string): Promise<Practice | undefined> {
    return this.practices.get(id);
  }

  async createPractice(insertPractice: InsertPractice): Promise<Practice> {
    const id = randomUUID();
    const practice: Practice = {
      ...insertPractice,
      id,
      vaultMinutes: insertPractice.vaultMinutes || 0,
      barsMinutes: insertPractice.barsMinutes || 0,
      beamMinutes: insertPractice.beamMinutes || 0,
      floorMinutes: insertPractice.floorMinutes || 0,
      skillIds: insertPractice.skillIds || null,
    };
    this.practices.set(id, practice);
    return practice;
  }

  async updatePractice(id: string, data: Partial<InsertPractice>): Promise<Practice | undefined> {
    const existing = this.practices.get(id);
    if (!existing) return undefined;
    const updated: Practice = { ...existing, ...data };
    this.practices.set(id, updated);
    return updated;
  }

  async deletePractice(id: string): Promise<boolean> {
    return this.practices.delete(id);
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      ...insertGoal,
      id,
      athleteId: insertGoal.athleteId || null,
      description: insertGoal.description || null,
      linkedSkillIds: insertGoal.linkedSkillIds || null,
      linkedEvent: insertGoal.linkedEvent || null,
      completed: insertGoal.completed || false,
      progress: insertGoal.progress || 0,
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, data: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existing = this.goals.get(id);
    if (!existing) return undefined;
    const updated: Goal = { ...existing, ...data };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Routines
  async getRoutines(): Promise<Routine[]> {
    return Array.from(this.routines.values());
  }

  async getRoutine(id: string): Promise<Routine | undefined> {
    return this.routines.get(id);
  }

  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const id = randomUUID();
    const routine: Routine = {
      ...insertRoutine,
      id,
      startValue: insertRoutine.startValue || 0,
      crFulfilled: insertRoutine.crFulfilled || false,
      cvBonus: insertRoutine.cvBonus || 0,
      groupBonus: insertRoutine.groupBonus || 0,
      crBonus: insertRoutine.crBonus || 0,
    };
    this.routines.set(id, routine);
    return routine;
  }

  async updateRoutine(id: string, data: Partial<InsertRoutine>): Promise<Routine | undefined> {
    const existing = this.routines.get(id);
    if (!existing) return undefined;
    const updated: Routine = { ...existing, ...data };
    this.routines.set(id, updated);
    return updated;
  }

  async deleteRoutine(id: string): Promise<boolean> {
    return this.routines.delete(id);
  }
}

export const storage = new MemStorage();
