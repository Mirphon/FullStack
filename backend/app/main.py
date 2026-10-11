from fastapi import FastAPI

from app.api import cars, inspections, users
from app.errors import add_error_handlers

app = FastAPI(
    title="Осмотр авто — API",
    description="Пользователи, автомобили и осмотры.",
    version="1.0.0",
)
add_error_handlers(app)
app.include_router(users.router, prefix="/api")
app.include_router(cars.router, prefix="/api")
app.include_router(inspections.router, prefix="/api")
