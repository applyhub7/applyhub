import { gatewayConfig } from "./config.js";

async function verifyToken(authHeader) {
  if (!authHeader) return null;
  const response = await fetch(`${gatewayConfig.authUrl}/auth/verify`, {
    headers: { authorization: authHeader },
  });
  if (!response.ok) return null;
  return response.json();
}

export async function forward(request, reply, targetUrl, needsAuth = true) {
  const authHeader = request.headers.authorization || "";
  const verified = needsAuth ? await verifyToken(authHeader) : null;
  if (needsAuth && !verified?.user) {
    return reply.code(401).send({ message: "unauthorized" });
  }

  const headers = {
    "content-type": request.headers["content-type"] || "application/json",
  };
  if (authHeader) headers.authorization = authHeader;
  if (verified?.user) {
    headers["x-user-id"] = verified.user.sub;
    headers["x-user-role"] = verified.user.role;
    headers["x-user"] = JSON.stringify({
      id: verified.user.sub,
      email: verified.user.email,
      role: verified.user.role,
      name: verified.user.email?.split("@")[0] || "",
    });
  }

  const url = new URL(request.url, targetUrl);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : JSON.stringify(request.body || {});
  const upstream = await fetch(url, { method: request.method, headers, body });
  const text = await upstream.text();
  reply.code(upstream.status);
  if (!text) return reply.send();
  return reply.type(upstream.headers.get("content-type") || "application/json").send(JSON.parse(text));
}
