from pydantic import BaseModel, EmailStr
from app.dto.common import DNI, Telefono, FechaNacimiento

class PacienteCreate(DNI, Telefono, FechaNacimiento):
    nombre: str
    apellido: str
    mail: EmailStr | None = None

class PacienteUpdate(PacienteCreate): pass

class PacienteOut(PacienteCreate):
    id: int
