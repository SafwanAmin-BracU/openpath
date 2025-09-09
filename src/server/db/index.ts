import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Load environment variables from .env file
const connectionString = process.env.AUTH_DRIZZLE_URL;

// Check if the connection string is set
if (!connectionString)
  throw new Error("AUTH_DRIZZLE_URL environment variable is not set");

const pool = postgres(connectionString, { max: 1 });
export const db = drizzle(pool, {
  schema,
});
export { schema };
export * from './utils';