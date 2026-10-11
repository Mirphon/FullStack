import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.schema import CreateSchema, DropSchema

test_database = os.environ.get("TEST_DB_NAME", "")
if not test_database.endswith("_test"):
    raise RuntimeError("Задайте TEST_DB_NAME с окончанием _test. Тесты требуют отдельную PostgreSQL-базу.")
os.environ["DB_NAME"] = test_database

from app.config import settings
from app.database import Base, get_db
from app.main import app


@pytest.fixture
def database():
    admin_engine = create_engine(settings.database_url, connect_args={"connect_timeout": 5})
    schema = "test_" + uuid4().hex
    with admin_engine.begin() as connection:
        connection.execute(CreateSchema(schema))
    engine = create_engine(
        settings.database_url,
        connect_args={"options": f"-csearch_path={schema}", "connect_timeout": 5},
    )
    try:
        Base.metadata.create_all(engine)
        yield engine
    finally:
        engine.dispose()
        with admin_engine.begin() as connection:
            connection.execute(DropSchema(schema, cascade=True))
        admin_engine.dispose()


@pytest.fixture
def client(database):
    sessions = sessionmaker(bind=database, expire_on_commit=False)

    def test_session():
        with sessions() as session:
            yield session

    app.dependency_overrides[get_db] = test_session
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def records(client):
    user = client.post("/api/users", json={"name": "Михаил", "email": "mikhail@example.com"})
    assert user.status_code == 201, user.text
    car = client.post("/api/cars", json={
        "user_id": user.json()["id"], "brand": "Toyota", "model": "Camry", "year": 2018, "body": "Седан",
    })
    assert car.status_code == 201, car.text
    inspection = client.post("/api/inspections", json={
        "car_id": car.json()["id"], "photo_name": "car.jpg", "notes": "Фото автомобиля целиком",
    })
    assert inspection.status_code == 201, inspection.text
    return user.json(), car.json(), inspection.json()
