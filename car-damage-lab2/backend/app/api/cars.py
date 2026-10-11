from fastapi import APIRouter, Response

from app.api.dependencies import Database, Limit, Offset, RecordId, ParentId
from app.crud import cars
from app.schemas.common import ErrorResponse
from app.schemas.car import CarCreate, CarRead, CarUpdate

router = APIRouter(
    prefix="/cars",
    tags=["Автомобили"],
    responses={
        404: {"model": ErrorResponse, "description": "Запись не найдена"},
        409: {"model": ErrorResponse, "description": "Конфликт данных"},
        422: {"model": ErrorResponse, "description": "Ошибка валидации"},
        503: {"model": ErrorResponse, "description": "База данных недоступна"},
    },
)


@router.get("", response_model=list[CarRead], summary="Получить список")
def list_cars(db: Database, offset: Offset = 0, limit: Limit = 20, user_id: ParentId = None):
    return cars.get_cars(db, offset, limit, user_id)


@router.get("/{car_id}", response_model=CarRead, summary="Получить запись")
def read_car(car_id: RecordId, db: Database):
    return cars.get_car(db, car_id)


@router.post("", response_model=CarRead, status_code=201, summary="Создать запись")
def create_car(data: CarCreate, db: Database):
    return cars.create_car(db, data)


@router.put("/{car_id}", response_model=CarRead, summary="Изменить запись полностью")
def update_car(car_id: RecordId, data: CarUpdate, db: Database):
    return cars.update_car(db, car_id, data)


@router.delete("/{car_id}", status_code=204, summary="Удалить запись")
def delete_car(car_id: RecordId, db: Database):
    cars.delete_car(db, car_id)
    return Response(status_code=204)
