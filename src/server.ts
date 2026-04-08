import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import habitRoutes from "./routes/habitRoutes.ts";
import { isTest } from "../env.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("dev", {
    skip: () => isTest(),
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "hello" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/habits", habitRoutes);

app.use(errorHandler);

export { app };

export default app;
