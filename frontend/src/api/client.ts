const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path: string, options: RequestInit = {}, token?: string | null) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || "request failed");
  return data;
}

export const api = {
  request,
  register: (body: unknown) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: unknown) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: (body: unknown) => request("/auth/logout", { method: "POST", body: JSON.stringify(body) }),
  verify: (token?: string | null) => request("/auth/verify", {}, token),
  jobs: (token?: string | null) => request("/jobs", {}, token),
  createJob: (body: unknown, token?: string | null) => request("/jobs", { method: "POST", body: JSON.stringify(body) }, token),
  apply: (body: unknown, token?: string | null) => request("/applications", { method: "POST", body: JSON.stringify(body) }, token),
  myApplications: (token?: string | null) => request("/applications/me", {}, token),
  jobApplications: (jobId: string, token?: string | null) => request(`/applications/job/${jobId}`, {}, token),
  updateApplication: (id: string, body: unknown, token?: string | null) =>
    request(`/applications/${id}/status`, { method: "PATCH", body: JSON.stringify(body) }, token),
};
