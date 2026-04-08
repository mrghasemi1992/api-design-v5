import { Router } from "express";
import { validateBody, validateParams } from "../middlewares/validation.ts";
import { z } from "zod";
import { authenticateToken } from "../middlewares/auth.ts";
import {
  createHabit,
  getUserHabits,
  updateHabit,
} from "../controllers/habitController.ts";

const createHabitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  frequency: z.string(),
  targetCount: z.number(),
  tagIds: z.array(z.string()).optional(),
});

const completeParamsSchema = z.object({
  id: z.string().max(3),
});

const router = Router();

router.use(authenticateToken);

router.get("/", authenticateToken, getUserHabits);

router.patch("/:id", updateHabit);

router.get("/:id", (req, res) => {
  res.json({ message: "got one habit" });
});

router.post("/", validateBody(createHabitSchema), createHabit);

router.delete("/:id", (req, res) => {
  res.json({ message: "deleted habit" });
});

router.post(
  "/:id/complete",
  validateParams(completeParamsSchema),
  validateBody(createHabitSchema),
  (req, res) => {
    res.status(201).json({ message: "completed habit" });
  },
);

export default router;
