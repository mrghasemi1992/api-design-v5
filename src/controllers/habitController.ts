import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.ts";
import db from "../db/connection.ts";
import { habits, habitTags } from "../db/schema.ts";
import { and, desc, eq } from "drizzle-orm";

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body;

    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId: req.user.id,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning();

      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit?.id,
          tagId,
        }));

        await tx.insert(habitTags).values(habitTagValues);
      }

      return newHabit;
    });

    res.status(201).json({
      messages: "Habit created",
      habit: result,
    });
  } catch (e) {
    console.error("Create habit error", e);
    res.status(500).json({ errors: "Failed to create habit" });
  }
};

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    });

    const habitsWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((habitTag) => habitTag.tag),
      habitTags: undefined,
    }));

    res.json({
      habits: habitsWithTags,
    });
  } catch (e) {
    console.error("Get habits error", e);
    res.status(500).json({ errors: "Failed to fetch habits" });
  }
};

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { tagIds, ...updates } = req.body;

    const result = await db.transaction(async (tx) => {
      const [updatedHabit] = await tx
        .update(habits)
        .set({ ...updates, updatedAt: new Date() })
        // FIXME: habits.id or habitTags.id?
        .where(and(eq(habits.id, id), eq(habits.userId, req.user?.id!)))
        .returning();

      if (!updateHabit) {
        return res.status(401).end();
      }

      if (tagIds !== undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id));

        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId: string) => ({
            habitId: id,
            tagId,
          }));

          await tx.insert(habitTags).values(habitTagValues);
        }
      }

      return updatedHabit;
    });

    res.status(201).json({
      messages: "Habit was updated",
      habit: result,
    });
  } catch (e) {
    console.error("Update habit error", e);
    res.status(500).json({ errors: "Failed to update habit" });
  }
};
