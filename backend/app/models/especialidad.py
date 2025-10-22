from dataclasses import dataclass
from datetime import datetime

@dataclass
class EspecialidadModel:
    id: int
    nombre: str
    created_at: datetime | None
