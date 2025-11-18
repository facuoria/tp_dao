from dataclasses import dataclass
from datetime import datetime, time

@dataclass
class AgendaModel:
    id: int
    medico_id: int
    dia_semana: int
    hora_inicio: time
    hora_fin: time
    duracion_min: int
    created_at: datetime | None
