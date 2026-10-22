from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Car(Base):
    __tablename__ = "cars"
    __table_args__ = (CheckConstraint("year >= 1900 AND year <= 9999", name="car_year_range"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    brand: Mapped[str] = mapped_column(String(60))
    model: Mapped[str] = mapped_column(String(60))
    year: Mapped[int]
    body: Mapped[str | None] = mapped_column(String(30))

    user: Mapped["User"] = relationship(back_populates="cars")
    inspections: Mapped[list["Inspection"]] = relationship(
        back_populates="car", cascade="all, delete-orphan", passive_deletes=True
    )
