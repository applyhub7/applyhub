from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(min_length=1)
    companyId: str = Field(min_length=1)
    location: str = Field(min_length=1)
    description: str = Field(min_length=1)
    type: str = "full-time"
    status: str = "open"


class JobUpdate(BaseModel):
    title: str | None = None
    location: str | None = None
    description: str | None = None
    type: str | None = None
    status: str | None = None
