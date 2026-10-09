import express from "express";
import cors from "cors";
import pool from "./database.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cors());

app.get("/api/entry", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT data FROM entries ORDER BY pk"
    );
    res.json(rows.map((r) => r.data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load entries" });
  }
});

app.post("/api/entry", async (req, res) => {
  try {
    await pool.query( "INSERT INTO entries (entry_id, data) VALUES ($1, $2) ON CONFLICT (entry_id) DO NOTHING", [String(req.body.id), req.body]);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

export default app;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log("Backend on" + port);
  });
}
