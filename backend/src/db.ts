import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// 1. Check if the fallback DATABASE_URL or individual variables are available
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "5432";
  const name = process.env.DB_NAME;

  if (!user || !password || !name) {
    throw new Error(
      "❌ Database configuration missing: Provide either DATABASE_URL or DB_USER, DB_PASSWORD, and DB_NAME in your .env file."
    );
  }

  // Safely construct the URI if DATABASE_URL wasn't provided directly
  connectionString = `postgres://${user}:${password}@${host}:${port}/${name}`;
}

// 2. Initialize the raw PostgreSQL connection pool
const pool = new Pool({
  connectionString: connectionString,
});

// 3. Immediately test the connection when the backend boots up
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed! Verify your .env credentials.");
    console.error(err.stack);
  } else {
    console.log("✅ Drizzle ORM connected to PostgreSQL successfully!");
  }
});

// 4. Export the Drizzle Database Instance
export const db = drizzle(pool);