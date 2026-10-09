from datetime import date

import pytest
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.models import Car, Inspection, User


def test_crud_and_persistence(client, database, records):
    user, car, inspection = records
    for resource, item in zip(("users", "cars", "inspections"), records):
        assert client.get(f"/api/{resource}/{item['id']}").json() == item
        assert client.get(f"/api/{resource}").json() == [item]

    user_data = {"name": "Иван", "email": "ivan@example.com"}
    assert client.put(f"/api/users/{user['id']}", json=user_data).status_code == 200
    car_data = {"user_id": user["id"], "brand": "Kia", "model": "Rio", "year": 2020, "body": None}
    assert client.put(f"/api/cars/{car['id']}", json=car_data).status_code == 200
    inspection_data = {"car_id": car["id"], "photo_name": "new.webp", "notes": None}
    assert client.put(f"/api/inspections/{inspection['id']}", json=inspection_data).status_code == 200

    with Session(database) as db:
        assert db.get(User, user["id"]).name == "Иван"
        assert db.get(Car, car["id"]).brand == "Kia"
        assert db.get(Car, car["id"]).body is None
        assert db.get(Inspection, inspection["id"]).photo_name == "new.webp"
        assert db.get(Inspection, inspection["id"]).notes is None

    for resource, item in reversed(list(zip(("users", "cars", "inspections"), records))):
        response = client.delete(f"/api/{resource}/{item['id']}")
        assert response.status_code == 204
        assert response.content == b""
        assert client.get(f"/api/{resource}/{item['id']}").status_code == 404
    with Session(database) as db:
        assert db.scalar(select(User)) is None
        assert db.scalar(select(Car)) is None
        assert db.scalar(select(Inspection)) is None


def test_unique_email_and_rollback(client, records):
    user, _, _ = records
    duplicate = client.post("/api/users", json={"name": "Другое имя", "email": "MIKHAIL@EXAMPLE.COM"})
    assert duplicate.status_code == 409
    other = client.post("/api/users", json={"name": "Анна", "email": "anna@example.com"}).json()
    response = client.put(f"/api/users/{other['id']}", json={"name": "Новое имя", "email": user["email"]})
    assert response.status_code == 409
    assert client.get(f"/api/users/{other['id']}").json()["name"] == "Анна"


@pytest.mark.parametrize("resource", ["users", "cars", "inspections"])
def test_missing_record(client, resource):
    assert client.get(f"/api/{resource}/99999").status_code == 404
    assert client.delete(f"/api/{resource}/99999").status_code == 404
    assert client.get(f"/api/{resource}/0").status_code == 422
    assert client.get(f"/api/{resource}/abc").status_code == 422


@pytest.mark.parametrize("path,payload", [
    ("users", {"name": "   ", "email": "valid@example.com"}),
    ("users", {"name": "Имя", "email": "wrong"}),
    ("users", {"name": "Имя", "email": "valid@example.com", "password": "not-supported"}),
    ("cars", {"user_id": 1, "brand": "", "model": "Camry", "year": 2018}),
    ("cars", {"user_id": 1, "brand": "Toyota", "model": "Camry", "year": 1899}),
    ("cars", {"user_id": 1, "brand": "Toyota", "model": "Camry", "year": date.today().year + 1}),
    ("cars", {"user_id": 1, "brand": "Toyota", "model": "Camry", "year": "2018"}),
    ("cars", {"user_id": 1, "brand": "Toyota", "model": "Camry", "year": 2018, "body": "неизвестный"}),
    ("inspections", {"car_id": 1, "photo_name": "document.pdf"}),
    ("inspections", {"car_id": 1, "photo_name": "../car.jpg"}),
    ("inspections", {"car_id": 1, "photo_name": "car.jpg", "notes": "x" * 2001}),
])
def test_validation(client, path, payload):
    response = client.post(f"/api/{path}", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"] == "Проверьте данные запроса"
    assert response.json()["errors"][0]["field"].startswith("body.")


def test_missing_parent_and_failed_update(client, records):
    user, car, inspection = records
    car_data = {"user_id": 99999, "brand": "Toyota", "model": "Camry", "year": 2018}
    photo_data = {"car_id": 99999, "photo_name": "car.png"}
    assert client.post("/api/cars", json=car_data).status_code == 404
    assert client.post("/api/inspections", json=photo_data).status_code == 404
    assert client.put(f"/api/cars/{car['id']}", json=car_data).status_code == 404
    assert client.put(f"/api/inspections/{inspection['id']}", json=photo_data).status_code == 404
    assert client.get(f"/api/cars/{car['id']}").json()["user_id"] == user["id"]
    assert client.get(f"/api/inspections/{inspection['id']}").json()["car_id"] == car["id"]
    assert client.put("/api/users/99999", json={"name": "Имя", "email": "new@example.com"}).status_code == 404


def test_user_delete_cascades_without_affecting_others(client, database, records):
    user, car, inspection = records
    other = client.post("/api/users", json={"name": "Анна", "email": "anna@example.com"}).json()
    assert client.delete(f"/api/users/{user['id']}").status_code == 204
    with Session(database) as db:
        assert db.get(User, user["id"]) is None
        assert db.get(Car, car["id"]) is None
        assert db.get(Inspection, inspection["id"]) is None
        assert db.get(User, other["id"]) is not None


def test_car_delete_keeps_user(client, database, records):
    user, car, inspection = records
    assert client.delete(f"/api/cars/{car['id']}").status_code == 204
    with Session(database) as db:
        assert db.get(User, user["id"]) is not None
        assert db.get(Car, car["id"]) is None
        assert db.get(Inspection, inspection["id"]) is None


def test_database_cascade_without_orm(client, database, records):
    user, car, inspection = records
    with database.begin() as connection:
        connection.execute(text("DELETE FROM users WHERE id = :id"), {"id": user["id"]})
    assert client.get(f"/api/cars/{car['id']}").status_code == 404
    assert client.get(f"/api/inspections/{inspection['id']}").status_code == 404


def test_filters_and_pagination(client, records):
    user, car, inspection = records
    assert client.get(f"/api/cars?user_id={user['id']}").json() == [car]
    assert client.get("/api/cars?user_id=99999").json() == []
    assert client.get(f"/api/inspections?car_id={car['id']}").json() == [inspection]
    assert client.get("/api/users?offset=1&limit=1").json() == []
    assert client.get("/api/users?limit=101").status_code == 422
    assert client.get("/api/cars?offset=-1").status_code == 422


def test_swagger_and_schema(client):
    assert client.get("/docs").status_code == 200
    schema = client.get("/openapi.json").json()
    assert len(schema["paths"]) == 6
    assert schema["paths"]["/api/cars"]["post"]["responses"]["422"]["content"]["application/json"]["schema"]["$ref"].endswith("ErrorResponse")
