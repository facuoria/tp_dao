from dataclasses import dataclass
from datetime import datetime

@dataclass
class MedicoModel:
    id: int
    nombre: str | None
    apellido: str | None
    matricula: str | None
    mail: str | None
    especialidad_id: int
    created_at: datetime | None
