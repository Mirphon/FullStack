from datetime import datetime

from pydantic import Field, field_validator

from app.schemas.common import InputSchema, OutputSchema


class InspectionCreate(InputSchema):
    car_id: int = Field(gt=0)
    photo_name: str = Field(min_length=1, max_length=255)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("photo_name")
    @classmethod
    def check_photo_name(cls, value: str) -> str:
        if any(character in value for character in ("/", "\\", "\x00")):
            raise ValueError("Укажите только имя фотографии без пути")
        if not value.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            raise ValueError("Допускаются имена фотографий JPG, PNG и WebP")
        return value


class InspectionUpdate(InspectionCreate):
    pass


class InspectionRead(OutputSchema):
    id: int
    car_id: int
    photo_name: str
    notes: str | None
    created_at: datetime
