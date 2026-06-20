import psycopg2
from psycopg2.extras import RealDictCursor

from .config import DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER


def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        cursor_factory=RealDictCursor,
    )


def init_db():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS jobs (
                    id UUID PRIMARY KEY,
                    title TEXT NOT NULL,
                    company_id TEXT NOT NULL,
                    location TEXT NOT NULL,
                    description TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'full-time',
                    status TEXT NOT NULL DEFAULT 'open',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
            connection.commit()
