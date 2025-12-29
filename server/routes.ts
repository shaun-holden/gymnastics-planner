import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertAthleteSchema,
  insertSkillSchema,
  insertPracticeSchema,
  insertGoalSchema,
  insertRoutineSchema,
  insertCurriculumSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Athletes CRUD
  app.get("/api/athletes", async (req: Request, res: Response) => {
    try {
      const athletes = await storage.getAthletes();
      res.json(athletes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch athletes" });
    }
  });

  app.get("/api/athletes/:id", async (req: Request, res: Response) => {
    try {
      const athlete = await storage.getAthlete(req.params.id);
      if (!athlete) {
        return res.status(404).json({ error: "Athlete not found" });
      }
      res.json(athlete);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch athlete" });
    }
  });

  app.post("/api/athletes", async (req: Request, res: Response) => {
    try {
      const parsed = insertAthleteSchema.parse(req.body);
      const athlete = await storage.createAthlete(parsed);
      res.status(201).json(athlete);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create athlete" });
    }
  });

  app.patch("/api/athletes/:id", async (req: Request, res: Response) => {
    try {
      const parsed = insertAthleteSchema.partial().parse(req.body);
      const athlete = await storage.updateAthlete(req.params.id, parsed);
      if (!athlete) {
        return res.status(404).json({ error: "Athlete not found" });
      }
      res.json(athlete);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update athlete" });
    }
  });

  app.delete("/api/athletes/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteAthlete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Athlete not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete athlete" });
    }
  });

  // Skills CRUD
  app.get("/api/skills", async (req: Request, res: Response) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skills" });
    }
  });

  app.get("/api/skills/:id", async (req: Request, res: Response) => {
    try {
      const skill = await storage.getSkill(req.params.id);
      if (!skill) {
        return res.status(404).json({ error: "Skill not found" });
      }
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skill" });
    }
  });

  app.post("/api/skills", async (req: Request, res: Response) => {
    try {
      const parsed = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(parsed);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create skill" });
    }
  });

  app.patch("/api/skills/:id", async (req: Request, res: Response) => {
    try {
      const parsed = insertSkillSchema.partial().parse(req.body);
      const skill = await storage.updateSkill(req.params.id, parsed);
      if (!skill) {
        return res.status(404).json({ error: "Skill not found" });
      }
      res.json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update skill" });
    }
  });

  app.delete("/api/skills/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteSkill(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Skill not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete skill" });
    }
  });

  // Practices CRUD
  app.get("/api/practices", async (req: Request, res: Response) => {
    try {
      const practices = await storage.getPractices();
      res.json(practices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practices" });
    }
  });

  app.get("/api/practices/:id", async (req: Request, res: Response) => {
    try {
      const practice = await storage.getPractice(req.params.id);
      if (!practice) {
        return res.status(404).json({ error: "Practice not found" });
      }
      res.json(practice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practice" });
    }
  });

  app.post("/api/practices", async (req: Request, res: Response) => {
    try {
      const parsed = insertPracticeSchema.parse(req.body);
      const practice = await storage.createPractice(parsed);
      res.status(201).json(practice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create practice" });
    }
  });

  app.patch("/api/practices/:id", async (req: Request, res: Response) => {
    try {
      const parsed = insertPracticeSchema.partial().parse(req.body);
      const practice = await storage.updatePractice(req.params.id, parsed);
      if (!practice) {
        return res.status(404).json({ error: "Practice not found" });
      }
      res.json(practice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update practice" });
    }
  });

  app.delete("/api/practices/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deletePractice(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Practice not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete practice" });
    }
  });

  // Goals CRUD
  app.get("/api/goals", async (req: Request, res: Response) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const goal = await storage.getGoal(req.params.id);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goal" });
    }
  });

  app.post("/api/goals", async (req: Request, res: Response) => {
    try {
      const parsed = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(parsed);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const parsed = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(req.params.id, parsed);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteGoal(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Routines CRUD
  app.get("/api/routines", async (req: Request, res: Response) => {
    try {
      const routines = await storage.getRoutines();
      res.json(routines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routines" });
    }
  });

  app.get("/api/routines/:id", async (req: Request, res: Response) => {
    try {
      const routine = await storage.getRoutine(req.params.id);
      if (!routine) {
        return res.status(404).json({ error: "Routine not found" });
      }
      res.json(routine);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routine" });
    }
  });

  app.post("/api/routines", async (req: Request, res: Response) => {
    try {
      const parsed = insertRoutineSchema.parse(req.body);
      const routine = await storage.createRoutine(parsed);
      res.status(201).json(routine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create routine" });
    }
  });

  app.patch("/api/routines/:id", async (req: Request, res: Response) => {
    try {
      const parsed = insertRoutineSchema.partial().parse(req.body);
      const routine = await storage.updateRoutine(req.params.id, parsed);
      if (!routine) {
        return res.status(404).json({ error: "Routine not found" });
      }
      res.json(routine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update routine" });
    }
  });

  app.delete("/api/routines/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteRoutine(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Routine not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete routine" });
    }
  });

  // Admin: Force seed skills (useful for production)
  app.post("/api/admin/seed-skills", async (req: Request, res: Response) => {
    try {
      const existingSkills = await storage.getSkills();
      if (existingSkills.length > 0) {
        return res.json({ 
          message: `Database already has ${existingSkills.length} skills`,
          seeded: false,
          count: existingSkills.length
        });
      }
      await storage.seedSkills();
      const newSkills = await storage.getSkills();
      res.json({ 
        message: `Seeded ${newSkills.length} skills successfully`,
        seeded: true,
        count: newSkills.length
      });
    } catch (error) {
      console.error("Failed to seed skills:", error);
      res.status(500).json({ error: "Failed to seed skills", details: String(error) });
    }
  });

  // Diagnostic endpoint to check database status
  app.get("/api/admin/db-status", async (req: Request, res: Response) => {
    try {
      const skillCount = (await storage.getSkills()).length;
      const athleteCount = (await storage.getAthletes()).length;
      const practiceCount = (await storage.getPractices()).length;
      const goalCount = (await storage.getGoals()).length;
      const routineCount = (await storage.getRoutines()).length;
      const curriculumCount = (await storage.getCurriculumItems()).length;
      
      res.json({
        status: "connected",
        counts: {
          skills: skillCount,
          athletes: athleteCount,
          practices: practiceCount,
          goals: goalCount,
          routines: routineCount,
          curriculum: curriculumCount
        },
        env: process.env.NODE_ENV || "development"
      });
    } catch (error) {
      console.error("Database status check failed:", error);
      res.status(500).json({ 
        status: "error", 
        error: String(error),
        env: process.env.NODE_ENV || "development"
      });
    }
  });

  // Curriculum CRUD
  app.get("/api/curriculum", async (req: Request, res: Response) => {
    try {
      const items = await storage.getCurriculumItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch curriculum items" });
    }
  });

  app.get("/api/curriculum/:id", async (req: Request, res: Response) => {
    try {
      const item = await storage.getCurriculumItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Curriculum item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch curriculum item" });
    }
  });

  app.post("/api/curriculum", async (req: Request, res: Response) => {
    try {
      const parsed = insertCurriculumSchema.parse(req.body);
      const item = await storage.createCurriculumItem(parsed);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create curriculum item" });
    }
  });

  app.patch("/api/curriculum/:id", async (req: Request, res: Response) => {
    try {
      const parsed = insertCurriculumSchema.partial().parse(req.body);
      const item = await storage.updateCurriculumItem(req.params.id, parsed);
      if (!item) {
        return res.status(404).json({ error: "Curriculum item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update curriculum item" });
    }
  });

  app.delete("/api/curriculum/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteCurriculumItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Curriculum item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete curriculum item" });
    }
  });

  return httpServer;
}
