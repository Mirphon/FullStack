from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.common import commit
from app.models import User
from app.schemas.user import UserCreate, UserUpdate


def get_user(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user


def get_users(db: Session, offset: int, limit: int):
    return db.scalars(select(User).order_by(User.id).offset(offset).limit(limit)).all()


def check_email(db: Session, email: str, user_id: int | None = None):
    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None and existing.id != user_id:
        raise HTTPException(status_code=409, detail="Пользователь с такой почтой уже существует")


def create_user(db: Session, data: UserCreate) -> User:
    check_email(db, data.email)
    user = User(**data.model_dump())
    db.add(user)
    commit(db)
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, data: UserUpdate) -> User:
    user = get_user(db, user_id)
    check_email(db, data.email, user_id)
    for field, value in data.model_dump().items():
        setattr(user, field, value)
    commit(db)
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int):
    db.delete(get_user(db, user_id))
    commit(db)
