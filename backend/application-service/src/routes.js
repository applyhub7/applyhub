import { applyToJob, changeApplicationStatus, getApplicationResume, listJobApplications, listMyApplications } from "./service.js";
import { applicationConfig } from "./config.js";

function requireUser(request) {
  const user = request.headers["x-user"];
  return user ? JSON.parse(String(user)) : null;
}

export async function applicationRoutes(app) {
  app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "auth-service",
    environment: process.env.NODE_ENV || "production",
    uptime: process.uptime()
  });
});

  app.post("/applications", async (request, reply) => {
    const user = requireUser(request);
    if (!user) return reply.code(401).send({ message: "missing user" });
    const result = await applyToJob(user, request.body || {});
    if (result.error) return reply.code(result.error.status).send({ message: result.error.message });
    return reply.code(201).send(result.application);
  });

  app.get("/applications/me", async (request, reply) => {
    const user = requireUser(request);
    if (!user) return reply.code(401).send({ message: "missing user" });
    return listMyApplications(user);
  });

  app.get("/applications/job/:jobId", async (request, reply) => {
    const user = requireUser(request);
    if (!user) return reply.code(401).send({ message: "missing user" });
    const result = await listJobApplications(user, request.params.jobId);
    if (result.error) return reply.code(result.error.status).send({ message: result.error.message });
    return result;
  });

  app.get("/applications/:id/resume", async (request, reply) => {
    const user = requireUser(request);
    if (!user) return reply.code(401).send({ message: "missing user" });
    const result = await getApplicationResume(user, request.params.id);
    if (result.error) return reply.code(result.error.status).send({ message: result.error.message });
    return reply
      .header("content-type", result.contentType)
      .header("content-disposition", `inline; filename="${result.fileName.replaceAll('"', "")}"`)
      .send(result.stream);
  });

  app.patch("/applications/:id/status", async (request, reply) => {
    const user = requireUser(request);
    if (!user) return reply.code(401).send({ message: "missing user" });
    const result = await changeApplicationStatus(user, request.params.id, request.body?.status);
    if (result.error) return reply.code(result.error.status).send({ message: result.error.message });
    return result.application;
  });
}
