from pydantic import BaseModel

class AgendaOut(BaseModel):
    id: int
    medico_id: int
    dia_semana: int
    hora_inicio: str
    hora_fin: str
    duracion_min: int
