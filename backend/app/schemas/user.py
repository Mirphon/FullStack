from datetime import datetime

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import InputSchema, OutputSchema


class UserCreate(InputSchema):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr = Field(max_length=254)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()


class UserUpdate(UserCreate):
    pass


class UserRead(OutputSchema):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
