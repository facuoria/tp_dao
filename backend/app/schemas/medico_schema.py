from pydantic import BaseModel, ConfigDict, Field


class MedicoBase(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    matricula: str | int | None = None
    mail: str | None = None
    especialidad_id: int | str | None = Field(default=None)

    model_config = ConfigDict(extra="allow")


class MedicoCreate(MedicoBase):
    pass


class MedicoUpdate(MedicoBase):
    pass


class MedicoOut(MedicoBase):
    id: int
