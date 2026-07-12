import Fastify from "fastify";
import cors from "@fastify/cors";
import { gatewayRoutes } from "./routes.js";
import { gatewayConfig } from "./config.js";

const app = Fastify({ logger: { level: gatewayConfig.isProduction ? "info" : "debug" } });

if (!gatewayConfig.isProduction) {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}

await gatewayRoutes(app);
app.listen({ port: gatewayConfig.port, host: "0.0.0.0" });

// test ci ...