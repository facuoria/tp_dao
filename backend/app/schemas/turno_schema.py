from pydantic import BaseModel, ConfigDict


class TurnoCreate(BaseModel):
    paciente_id: int | str | None = None
    medico_id: int | str | None = None
    fecha_hora: str | None = None
    duracion_min: int | str | None = None
    estado_turno_id: int | str | None = None
    motivo: str | None = ""
    observaciones: str | None = ""

    model_config = ConfigDict(extra="allow")


class TurnoUpdate(BaseModel):
    estado_turno_id: int | str | None = None
    fecha_hora: str | None = None

    model_config = ConfigDict(extra="allow")
