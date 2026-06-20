from fastapi import FastAPI

from .db import init_db
from .routes import router


app = FastAPI(title="ApplyHub Job Service")
app.include_router(router)


@app.on_event("startup")
def startup():
    init_db()
