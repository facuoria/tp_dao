from pydantic import BaseModel, ConfigDict, Field


class AgendaBase(BaseModel):
    medico_id: int | str | None = Field(default=None, alias="medico_id")
    dia_semana: int | str | None = None
    hora_inicio: str | None = None
    hora_fin: str | None = None
    duracion_min: int | str | None = None

    model_config = ConfigDict(populate_by_name=True, extra="allow")


class AgendaCreate(AgendaBase):
    pass


class AgendaUpdate(AgendaBase):
    pass
