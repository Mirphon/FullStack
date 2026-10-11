from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.common import commit
from app.crud.users import get_user
from app.models import Car
from app.schemas.car import CarCreate, CarUpdate


def get_car(db: Session, car_id: int) -> Car:
    car = db.get(Car, car_id)
    if car is None:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return car


def get_cars(db: Session, offset: int, limit: int, user_id: int | None):
    query = select(Car).order_by(Car.id).offset(offset).limit(limit)
    if user_id is not None:
        query = query.where(Car.user_id == user_id)
    return db.scalars(query).all()


def create_car(db: Session, data: CarCreate) -> Car:
    get_user(db, data.user_id)
    car = Car(**data.model_dump())
    db.add(car)
    commit(db)
    db.refresh(car)
    return car


def update_car(db: Session, car_id: int, data: CarUpdate) -> Car:
    car = get_car(db, car_id)
    get_user(db, data.user_id)
    for field, value in data.model_dump().items():
        setattr(car, field, value)
    commit(db)
    db.refresh(car)
    return car


def delete_car(db: Session, car_id: int):
    db.delete(get_car(db, car_id))
    commit(db)
