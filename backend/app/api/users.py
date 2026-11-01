from fastapi import APIRouter, Response

from app.api.dependencies import Database, Limit, Offset, RecordId
from app.crud import users
from app.schemas.common import ErrorResponse
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(
    prefix="/users",
    tags=["Пользователи"],
    responses={
        404: {"model": ErrorResponse, "description": "Запись не найдена"},
        409: {"model": ErrorResponse, "description": "Конфликт данных"},
        422: {"model": ErrorResponse, "description": "Ошибка валидации"},
        503: {"model": ErrorResponse, "description": "База данных недоступна"},
    },
)


@router.get("", response_model=list[UserRead], summary="Получить список")
def list_users(db: Database, offset: Offset = 0, limit: Limit = 20):
    return users.get_users(db, offset, limit)


@router.get("/{user_id}", response_model=UserRead, summary="Получить запись")
def read_user(user_id: RecordId, db: Database):
    return users.get_user(db, user_id)


@router.post("", response_model=UserRead, status_code=201, summary="Создать запись")
def create_user(data: UserCreate, db: Database):
    return users.create_user(db, data)


@router.put("/{user_id}", response_model=UserRead, summary="Изменить запись полностью")
def update_user(user_id: RecordId, data: UserUpdate, db: Database):
    return users.update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=204, summary="Удалить запись")
def delete_user(user_id: RecordId, db: Database):
    users.delete_user(db, user_id)
    return Response(status_code=204)
