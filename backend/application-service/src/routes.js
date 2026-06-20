import { applyToJob, changeApplicationStatus, listJobApplications, listMyApplications } from "./service.js";

function requireUser(request) {
  const user = request.headers["x-user"];
  return user ? JSON.parse(String(user)) : null;
}

export async function applicationRoutes(app) {
  app.get("/health", async () => ({ ok: true, service: "application" }));

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

  app.patch("/applications/:id/status", async (request, reply) => {
    const user = requireUser(request);
    if (!user) return reply.code(401).send({ message: "missing user" });
    const result = await changeApplicationStatus(user, request.params.id, request.body?.status);
    if (result.error) return reply.code(result.error.status).send({ message: result.error.message });
    return result.application;
  });
}
