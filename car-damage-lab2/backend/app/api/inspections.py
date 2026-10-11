from fastapi import APIRouter, Response

from app.api.dependencies import Database, Limit, Offset, RecordId, ParentId
from app.crud import inspections
from app.schemas.common import ErrorResponse
from app.schemas.inspection import InspectionCreate, InspectionRead, InspectionUpdate

router = APIRouter(
    prefix="/inspections",
    tags=["Осмотры"],
    responses={
        404: {"model": ErrorResponse, "description": "Запись не найдена"},
        409: {"model": ErrorResponse, "description": "Конфликт данных"},
        422: {"model": ErrorResponse, "description": "Ошибка валидации"},
        503: {"model": ErrorResponse, "description": "База данных недоступна"},
    },
)


@router.get("", response_model=list[InspectionRead], summary="Получить список")
def list_inspections(db: Database, offset: Offset = 0, limit: Limit = 20, car_id: ParentId = None):
    return inspections.get_inspections(db, offset, limit, car_id)


@router.get("/{inspection_id}", response_model=InspectionRead, summary="Получить запись")
def read_inspection(inspection_id: RecordId, db: Database):
    return inspections.get_inspection(db, inspection_id)


@router.post("", response_model=InspectionRead, status_code=201, summary="Создать запись")
def create_inspection(data: InspectionCreate, db: Database):
    return inspections.create_inspection(db, data)


@router.put("/{inspection_id}", response_model=InspectionRead, summary="Изменить запись полностью")
def update_inspection(inspection_id: RecordId, data: InspectionUpdate, db: Database):
    return inspections.update_inspection(db, inspection_id, data)


@router.delete("/{inspection_id}", status_code=204, summary="Удалить запись")
def delete_inspection(inspection_id: RecordId, db: Database):
    inspections.delete_inspection(db, inspection_id)
    return Response(status_code=204)
