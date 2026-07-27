from fastapi import APIRouter, Header, HTTPException

from .repository import create_job, delete_job, get_job, list_jobs, update_job
from .schemas import JobCreate, JobUpdate

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/jobs")
def jobs():
    items = list_jobs()
    return {"items": items}


@router.get("/jobs/{job_id}")
def job_detail(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="job not found")
    return {"job": job}


@router.post("/jobs", status_code=201)
def create_job_route(
    payload: JobCreate,
    x_user_id: str | None = Header(default=None),
    x_user_role: str | None = Header(default=None),
):
    if not x_user_id or not x_user_role:
        raise HTTPException(status_code=401, detail="missing auth headers")
    if x_user_role != "recruiter":
        raise HTTPException(status_code=403, detail="forbidden")
    if (
        not payload.title.strip()
        or not payload.companyId.strip()
        or not payload.location.strip()
        or not payload.description.strip()
    ):
        raise HTTPException(status_code=422, detail="invalid payload")
    return {"job": create_job(payload.model_dump())}


@router.put("/jobs/{job_id}")
def update_job_route(
    job_id: str,
    payload: JobUpdate,
    x_user_id: str | None = Header(default=None),
    x_user_role: str | None = Header(default=None),
):
    if not x_user_id or not x_user_role:
        raise HTTPException(status_code=401, detail="missing auth headers")
    if x_user_role != "recruiter":
        raise HTTPException(status_code=403, detail="forbidden")
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="job not found")
    if job["companyId"] != x_user_id:
        raise HTTPException(status_code=403, detail="forbidden")
    updated = update_job(job_id, payload.model_dump(exclude_none=True))
    return {"job": updated}


@router.delete("/jobs/{job_id}", status_code=204)
def delete_job_route(
    job_id: str,
    x_user_id: str | None = Header(default=None),
    x_user_role: str | None = Header(default=None),
):
    if not x_user_id or not x_user_role:
        raise HTTPException(status_code=401, detail="missing auth headers")
    if x_user_role != "recruiter":
        raise HTTPException(status_code=403, detail="forbidden")
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="job not found")
    if job["companyId"] != x_user_id:
        raise HTTPException(status_code=403, detail="forbidden")
    delete_job(job_id)
    return None
