from dataclasses import dataclass
from datetime import date

@dataclass
class RecetaModel:
    id: int
    turno_id: int | None
    medico_id: int
    paciente_id: int
    fecha_emision: date
    indicaciones: str | None
