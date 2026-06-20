import express from "express";
import cors from "cors";
import { authRoutes } from "./routes.js";
import { authConfig } from "./config.js";
import { initAuthDb } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
await initAuthDb();
await authRoutes(app);
app.listen(authConfig.port, () => console.log(`auth service listening on ${authConfig.port}`));
