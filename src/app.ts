import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { envVars } from "./app/config/env";

const app = express();

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [envVars.FRONTEND_URL, "http://localhost:3000", "https://care-academy-frontend.vercel.app"],
    credentials: true,
  }),
);

app.use("/api/v1", router);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Care Consultancy server is running" });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
