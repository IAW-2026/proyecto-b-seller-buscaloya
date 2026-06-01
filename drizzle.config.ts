import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Usamos .env.local para desarrollo, que es donde tenés tus variables locales
dotenv.config({ path: ".env.local" }); 

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Le decimos que use la unpooled (ideal para migraciones), 
    // y si no la encuentra, que use la DATABASE_URL estándar de Vercel
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!,
  },
});