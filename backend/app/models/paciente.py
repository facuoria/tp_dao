from dataclasses import dataclass
from datetime import date, datetime

@dataclass
class PacienteModel:
    id: int
    dni: str
    nombre: str | None
    apellido: str | None
    mail: str | None
    telefono: str | None
    fecha_nacimiento: date | None
    created_at: datetime | None
