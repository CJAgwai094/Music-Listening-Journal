import express from "express";
import pool from "./database.js";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: !!process.env.VERCEL,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Constant-time comparison (hashing first makes both buffers the same length)
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function isAdmin(req) { // check if user is an admin ( aka me :) ) 
  try {
    jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ error: "Not authorized" });
  next();
}

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

app.post("/api/login", loginLimiter, (req, res) => {
  if (!process.env.ADMIN_PASSPHRASE || !process.env.JWT_SECRET) {
    return res.status(500).json({ error: "Server not configured" });
  }
  if (!safeEqual(req.body?.passphrase ?? "", process.env.ADMIN_PASSPHRASE)) {
    return res.status(401).json({ error: "Wrong passphrase" });
  }
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, cookieOpts).json({ admin: true });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", cookieOpts).json({ admin: false });
});

// Always 200, so the frontend can check login state without console errors
app.get("/api/me", (req, res) => res.json({ admin: isAdmin(req) }));





app.get("/api/entry", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT data FROM entries ORDER BY pk DESC"
    );
    res.json(rows.map((r) => r.data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load entries" });
  }
});

app.post("/api/entry", requireAdmin, async (req, res) => {
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
