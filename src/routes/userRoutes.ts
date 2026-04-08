import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.ts";

const router = Router();

router.use(authenticateToken);

router.get("/", (req, res) => {
  res.json({ message: "users" });
});

router.get("/:id", (req, res) => {
  res.json({ message: "got user" });
});

router.put("/:id", (req, res) => {
  res.status(201).json({ messages: "user updated" });
});

router.delete("/", (req, res) => {
  res.json({ message: "deleted user" });
});

export default router;
