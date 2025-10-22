from pydantic import BaseModel, field_validator
from datetime import datetime

VALID = {"asignado","cancelado_medico","cancelado_paciente","atendido","ausente"}

class TurnoCreate(BaseModel):
    paciente_id: int
    medico_id: int
    fecha_hora: datetime
    duracion_min: int = 30
    motivo: str | None = None
    observaciones: str | None = None

class TurnoUpdate(TurnoCreate): pass

class TurnoEstado(BaseModel):
    estado: str
    @field_validator("estado")
    @classmethod
    def ok(cls, v: str):
        if v not in VALID: raise ValueError("Estado inválido")
        return v

class TurnoOut(BaseModel):
    id: int
    paciente_id: int
    medico_id: int
    fecha_hora: datetime
    duracion_min: int
    estado: str
    motivo: str | None = None
    observaciones: str | None = None
