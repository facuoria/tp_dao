from pydantic import BaseModel
from datetime import date

class RecetaCreate(BaseModel):
    turno_id: int | None = None
    medico_id: int
    paciente_id: int
    fecha_emision: date
    indicaciones: str | None = None

class RecetaOut(RecetaCreate):
    id: int
