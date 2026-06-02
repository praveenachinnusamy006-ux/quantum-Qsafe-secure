import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

import routes from "./routes";

dotenv.config();

const app = express();

/* ---------- Middleware ---------- */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* ---------- Upload Folder ---------- */

const uploadsPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use("/uploads", express.static(uploadsPath));

/* ---------- Routes ---------- */

app.use(routes);

/* ---------- Health Check ---------- */

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Quantum Secure Backend Running",
  });
});

/* ---------- Server ---------- */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
});