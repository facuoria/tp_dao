from pydantic import BaseModel, ConfigDict


class EspecialidadBase(BaseModel):
    nombre: str | None = None

    model_config = ConfigDict(extra="allow")


class EspecialidadCreate(EspecialidadBase):
    pass


class EspecialidadOut(EspecialidadBase):
    id: int
