from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.cars import get_car
from app.crud.common import commit
from app.models import Inspection
from app.schemas.inspection import InspectionCreate, InspectionUpdate


def get_inspection(db: Session, inspection_id: int) -> Inspection:
    inspection = db.get(Inspection, inspection_id)
    if inspection is None:
        raise HTTPException(status_code=404, detail="Осмотр не найден")
    return inspection


def get_inspections(db: Session, offset: int, limit: int, car_id: int | None):
    query = select(Inspection).order_by(Inspection.id).offset(offset).limit(limit)
    if car_id is not None:
        query = query.where(Inspection.car_id == car_id)
    return db.scalars(query).all()


def create_inspection(db: Session, data: InspectionCreate) -> Inspection:
    get_car(db, data.car_id)
    inspection = Inspection(**data.model_dump())
    db.add(inspection)
    commit(db)
    db.refresh(inspection)
    return inspection


def update_inspection(db: Session, inspection_id: int, data: InspectionUpdate) -> Inspection:
    inspection = get_inspection(db, inspection_id)
    get_car(db, data.car_id)
    for field, value in data.model_dump().items():
        setattr(inspection, field, value)
    commit(db)
    db.refresh(inspection)
    return inspection


def delete_inspection(db: Session, inspection_id: int):
    db.delete(get_inspection(db, inspection_id))
    commit(db)
