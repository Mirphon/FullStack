from datetime import date
from typing import Literal

from pydantic import Field, field_validator

from app.schemas.common import InputSchema, OutputSchema


BodyType = Literal["Седан", "Хэтчбек", "Универсал", "Кроссовер", "Внедорожник", "Купе", "Минивэн", "Пикап", "Другой"]


class CarCreate(InputSchema):
    user_id: int = Field(gt=0)
    brand: str = Field(min_length=1, max_length=60)
    model: str = Field(min_length=1, max_length=60)
    year: int = Field(ge=1900, strict=True)
    body: BodyType | None = None

    @field_validator("year")
    @classmethod
    def check_year(cls, value: int) -> int:
        if value > date.today().year:
            raise ValueError("Год выпуска не может быть больше текущего")
        return value


class CarUpdate(CarCreate):
    pass


class CarRead(OutputSchema):
    id: int
    user_id: int
    brand: str
    model: str
    year: int
    body: BodyType | None
