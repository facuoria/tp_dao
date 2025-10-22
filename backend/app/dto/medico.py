from pydantic import BaseModel, EmailStr

class MedicoCreate(BaseModel):
    nombre: str
    apellido: str
    matricula: str | None = None
    mail: EmailStr | None = None
    especialidad_id: int

class MedicoUpdate(MedicoCreate): pass

class MedicoOut(MedicoCreate):
    id: int
