import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "production" | "development";
  BCRYPT_SALT_ROUND: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASS: string;
  FRONTEND_URL: string;
}

const requiredEnvVariables: (keyof EnvConfig)[] = [
  "PORT",
  "DB_URL",
  "NODE_ENV",
  "BCRYPT_SALT_ROUND",
  "JWT_ACCESS_SECRET",
  "JWT_ACCESS_EXPIRES",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES",
  "SUPER_ADMIN_EMAIL",
  "SUPER_ADMIN_PASS",
  "FRONTEND_URL",
];

const loadEnvVariables = (): EnvConfig => {
  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  });

  return Object.fromEntries(
    requiredEnvVariables.map((key) => [key, process.env[key]]),
  ) as unknown as EnvConfig;
};

export const envVars = loadEnvVariables();
