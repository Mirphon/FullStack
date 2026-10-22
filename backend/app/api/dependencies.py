from typing import Annotated

from fastapi import Depends, Path, Query
from sqlalchemy.orm import Session

from app.database import get_db

Database = Annotated[Session, Depends(get_db)]
RecordId = Annotated[int, Path(gt=0)]
Offset = Annotated[int, Query(ge=0)]
Limit = Annotated[int, Query(ge=1, le=100)]
ParentId = Annotated[int | None, Query(gt=0)]
