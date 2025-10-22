from dataclasses import dataclass
from datetime import datetime

@dataclass
class TurnoModel:
    id: int
    paciente_id: int
    medico_id: int
    fecha_hora: datetime
    duracion_min: int
    estado: str
    motivo: str | None
    observaciones: str | None
    created_at: datetime | None
