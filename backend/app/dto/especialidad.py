from pydantic import BaseModel

class EspecialidadCreate(BaseModel):
    nombre: str

class EspecialidadOut(BaseModel):
    id: int
    nombre: str
