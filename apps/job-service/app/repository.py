from __future__ import annotations

import uuid
from datetime import datetime, timezone

from .db import get_connection


def _row_to_job(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "title": row["title"],
        "companyId": row["company_id"],
        "location": row["location"],
        "description": row["description"],
        "type": row["type"],
        "status": row["status"],
        "createdAt": row["created_at"].isoformat() if row.get("created_at") else None,
        "updatedAt": row["updated_at"].isoformat() if row.get("updated_at") else None,
    }


def list_jobs():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM jobs
                ORDER BY created_at DESC
                """
            )
            rows = cursor.fetchall()
    return [_row_to_job(row) for row in rows]


def get_job(job_id: str):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
            row = cursor.fetchone()
    return _row_to_job(row)


def create_job(payload: dict):
    now = datetime.now(timezone.utc)
    job_id = str(uuid.uuid4())
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO jobs (id, title, company_id, location, description, type, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    job_id,
                    payload["title"].strip(),
                    payload["companyId"].strip(),
                    payload["location"].strip(),
                    payload["description"].strip(),
                    payload.get("type", "full-time"),
                    payload.get("status", "open"),
                    now,
                    now,
                ),
            )
            connection.commit()
    return get_job(job_id)


def update_job(job_id: str, payload: dict):
    current = get_job(job_id)
    if not current:
        return None

    next_payload = {
        "title": payload.get("title", current["title"]),
        "location": payload.get("location", current["location"]),
        "description": payload.get("description", current["description"]),
        "type": payload.get("type", current["type"]),
        "status": payload.get("status", current["status"]),
    }
    now = datetime.now(timezone.utc)
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE jobs
                SET title = %s,
                    location = %s,
                    description = %s,
                    type = %s,
                    status = %s,
                    updated_at = %s
                WHERE id = %s
                """,
                (
                    next_payload["title"],
                    next_payload["location"],
                    next_payload["description"],
                    next_payload["type"],
                    next_payload["status"],
                    now,
                    job_id,
                ),
            )
            connection.commit()
    return get_job(job_id)


def delete_job(job_id: str):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM jobs WHERE id = %s", (job_id,))
            deleted = cursor.rowcount > 0
            connection.commit()
    return deleted
