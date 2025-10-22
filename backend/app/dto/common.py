from pydantic import BaseModel, field_validator
from datetime import date

class Page(BaseModel):
    data: list
    total: int

def _digits(v: str, min_len: int, max_len: int, field: str):
    s = (v or "").strip()
    if not s.isdigit() or not (min_len <= len(s) <= max_len):
        raise ValueError(f"{field} inválido")
    return s

class DNI(BaseModel):
    dni: str
    @field_validator("dni")
    @classmethod
    def val_dni(cls, v: str): return _digits(v, 7, 8, "DNI")

class Telefono(BaseModel):
    telefono: str | None = None
    @field_validator("telefono")
    @classmethod
    def val_tel(cls, v: str | None):
        if v in (None, ""): return v
        return _digits(v, 7, 15, "Teléfono")

class FechaNacimiento(BaseModel):
    fecha_nacimiento: date | None = None
    @field_validator("fecha_nacimiento")
    @classmethod
    def not_future(cls, v: date | None):
        if v and v > date.today(): raise ValueError("La fecha no puede ser futura")
        return v
