from app.database import Base, engine
from app import models


def main():
    Base.metadata.create_all(bind=engine)
    engine.dispose()
    print("Таблицы созданы")


if __name__ == "__main__":
    main()
