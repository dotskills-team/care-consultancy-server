/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedAdmin } from "./app/utils/seedAdmin";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("MongoDB connected");

    await seedAdmin();

    server = app.listen(envVars.PORT, () => {
      console.log(`Care Consultancy server is running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();

const shutdown = (reason: string, err?: unknown) => {
  console.log(`${reason}.... server shutting down`, err ?? "");
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => shutdown("Unhandled rejection", err));
process.on("uncaughtException", (err) => shutdown("Uncaught exception", err));
process.on("SIGTERM", () => shutdown("SIGTERM received"));
process.on("SIGINT", () => shutdown("SIGINT received"));
