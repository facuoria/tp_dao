from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class PacienteBase(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    mail: str | None = None
    telefono: str | None = None
    fecha_nacimiento: date | str | None = Field(default=None)

    model_config = ConfigDict(extra="allow")


class PacienteCreate(PacienteBase):
    dni: int | str | None = None


class PacienteUpdate(PacienteBase):
    dni: int | str | None = None


class PacienteOut(PacienteBase):
    id: int
    dni: int
