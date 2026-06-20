import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import {
  createRefreshToken,
  createUser,
  deleteRefreshToken,
  deleteRefreshTokensByUserId,
  findRefreshToken,
  findUserByEmail,
  findUserById,
} from "./repository.js";
import { authConfig } from "./config.js";

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, authConfig.jwtSecret, { expiresIn: authConfig.accessTtl });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, type: "refresh" }, authConfig.jwtSecret, { expiresIn: authConfig.refreshTtl });
}

export function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

export async function registerUser({ email, password, role, name }) {
  if (!email || !password || !role || !["candidate", "recruiter"].includes(role)) {
    return { error: { status: 400, message: "invalid payload" } };
  }
  const existing = await findUserByEmail(email);
  if (existing) return { error: { status: 409, message: "email already exists" } };
  const user = {
    id: randomUUID(),
    email,
    name: name || email.split("@")[0],
    role,
    passwordHash: await bcrypt.hash(password, 10),
  };
  await createUser(user);
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
    return { error: { status: 401, message: "invalid credentials" } };
  }
  const normalizedUser = { ...user, role: user.role === "company" ? "recruiter" : user.role };
  const accessToken = signAccessToken(normalizedUser);
  const refreshToken = signRefreshToken(user);
  await deleteRefreshTokensByUserId(user.id);
  await createRefreshToken({ id: randomUUID(), userId: user.id, token: refreshToken });
  return { user: sanitizeUser(normalizedUser), accessToken, refreshToken };
}

export async function logoutUser(refreshToken) {
  if (refreshToken) await deleteRefreshToken(refreshToken);
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) return { error: { status: 400, message: "refreshToken required" } };
  try {
    const payload = jwt.verify(refreshToken, authConfig.jwtSecret);
    const stored = await findRefreshToken(refreshToken);
    if (!stored) return { error: { status: 401, message: "refresh token revoked" } };
    const user = await findUserById(payload.sub);
    if (!user) return { error: { status: 401, message: "user not found" } };
    return { accessToken: signAccessToken(user) };
  } catch {
    return { error: { status: 401, message: "invalid refresh token" } };
  }
}

export function verifyAccessToken(authHeader) {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: { status: 401, message: "missing token" } };
  try {
    return { payload: jwt.verify(token, authConfig.jwtSecret) };
  } catch {
    return { error: { status: 401, message: "invalid token" } };
  }
}
