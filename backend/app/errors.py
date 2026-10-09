from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException


def validation_message(error: dict) -> str:
    messages = {
        "missing": "Обязательное поле",
        "extra_forbidden": "Неизвестное поле",
        "int_type": "Ожидается целое число",
        "int_parsing": "Ожидается целое число",
        "string_type": "Ожидается строка",
        "greater_than": "Значение должно быть больше {gt}",
        "greater_than_equal": "Значение должно быть не меньше {ge}",
        "less_than_equal": "Значение должно быть не больше {le}",
        "string_too_short": "Минимальная длина: {min_length}",
        "string_too_long": "Максимальная длина: {max_length}",
        "literal_error": "Допустимые значения: {expected}",
        "json_invalid": "Некорректный JSON",
        "model_attributes_type": "Ожидается JSON-объект",
    }
    if error["loc"] and error["loc"][-1] == "email" and error["type"] == "value_error":
        return "Введите корректный адрес электронной почты"
    if error["type"] in messages:
        return messages[error["type"]].format(**error.get("ctx", {}))
    return error["msg"].removeprefix("Value error, ")


def add_error_handlers(app: FastAPI):
    @app.exception_handler(HTTPException)
    async def http_error(request: Request, error: HTTPException):
        return JSONResponse(
            status_code=error.status_code,
            content={"detail": error.detail, "errors": []},
            headers=error.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, error: RequestValidationError):
        errors = [
            {"field": ".".join(map(str, item["loc"])), "message": validation_message(item)}
            for item in error.errors()
        ]
        return JSONResponse(status_code=422, content={"detail": "Проверьте данные запроса", "errors": errors})

    @app.exception_handler(SQLAlchemyError)
    async def database_error(request: Request, error: SQLAlchemyError):
        return JSONResponse(
            status_code=503,
            content={"detail": "Не удалось выполнить запрос к базе данных. Проверьте подключение и создание таблиц.", "errors": []},
        )
