import { authPool } from "./db.js";

export async function findUserByEmail(email) {
  const result = await authPool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await authPool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createUser(user) {
  await authPool.query(
    "INSERT INTO users (id, email, name, role, password_hash) VALUES ($1, $2, $3, $4, $5)",
    [user.id, user.email, user.name, user.role, user.passwordHash],
  );
}

export async function deleteRefreshTokensByUserId(userId) {
  await authPool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
}

export async function createRefreshToken(record) {
  await authPool.query(
    "INSERT INTO refresh_tokens (id, user_id, token) VALUES ($1, $2, $3)",
    [record.id, record.userId, record.token],
  );
}

export async function findRefreshToken(token) {
  const result = await authPool.query("SELECT 1 FROM refresh_tokens WHERE token = $1", [token]);
  return result.rowCount > 0;
}

export async function deleteRefreshToken(token) {
  await authPool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
}
