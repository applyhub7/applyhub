import { loginUser, logoutUser, refreshAccessToken, registerUser, verifyAccessToken } from "./service.js";
import { authConfig } from "./config.js";

export async function authRoutes(app) {
  app.get("/health", async () => ({ ok: true, service: "auth", environment: authConfig.nodeEnv }));

  app.post("/auth/register", async (req, res) => {
    const result = await registerUser(req.body || {});
    if (result.error) return res.status(result.error.status).json({ message: result.error.message });
    return res.status(201).json(result);
  });

  app.post("/auth/login", async (req, res) => {
    const result = await loginUser(req.body || {});
    if (result.error) return res.status(result.error.status).json({ message: result.error.message });
    return res.json(result);
  });

  app.post("/auth/logout", async (req, res) => {
    await logoutUser(req.body?.refreshToken);
    return res.status(204).end();
  });

  app.post("/auth/refresh", async (req, res) => {
    const result = await refreshAccessToken(req.body?.refreshToken);
    if (result.error) return res.status(result.error.status).json({ message: result.error.message });
    return res.json(result);
  });

  app.get("/auth/verify", async (req, res) => {
    const result = verifyAccessToken(req.headers.authorization || "");
    if (result.error) return res.status(result.error.status).json({ message: result.error.message });
    return res.json({ valid: true, user: result.payload });
  });
}
