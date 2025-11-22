from pydantic import BaseModel, ConfigDict


class RecetaCreate(BaseModel):
    turno_id: int | str | None = None
    medico_id: int | str | None = None
    paciente_id: int | str | None = None
    indicaciones: str | None = ""

    model_config = ConfigDict(extra="allow")
