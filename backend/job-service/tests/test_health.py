import sys
import types

from fastapi import FastAPI
from fastapi.testclient import TestClient

# /health does not use the repository, so keep this smoke test independent
# from the database driver and connection settings.
repository = types.ModuleType("app.repository")
repository.create_job = None
repository.delete_job = None
repository.get_job = None
repository.list_jobs = None
repository.update_job = None
sys.modules["app.repository"] = repository


def test_health_endpoint():
    from app.routes import router

    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
