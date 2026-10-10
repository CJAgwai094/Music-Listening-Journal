// backend/db.js
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3, // keep this small in serverless neon
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS entries (
    pk SERIAL PRIMARY KEY,
    entry_id TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

export default pool;