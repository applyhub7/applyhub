import os


def _env(name: str, default: str) -> str:
    value = os.getenv(name)
    return value if value is not None and value != "" else default


DB_HOST = _env("JOB_DB_HOST", "localhost")
DB_PORT = int(_env("JOB_DB_PORT", "5434"))
DB_NAME = _env("JOB_DB_NAME", "job_db")
DB_USER = _env("JOB_DB_USER", "applyhub")
DB_PASSWORD = _env("JOB_DB_PASSWORD", "applyhub")
PORT = int(_env("JOB_PORT", "4002"))
