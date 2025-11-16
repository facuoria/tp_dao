"""
DTOs (Pydantic) de request/response y utilidades comunes.
Permite importar todo desde app.dto:
    from app.dto import PacienteCreate, TurnoOut, Page
"""
from .common import Page, DNI, Telefono, FechaNacimiento

from .paciente import (
    PacienteCreate,
    PacienteUpdate,
    PacienteOut,
)

from .medico import (
    MedicoCreate,
    MedicoUpdate,
    MedicoOut,
)

from .especialidad import (
    EspecialidadCreate,
    EspecialidadOut,
)

from .agenda import (
    AgendaOut,
)

from .turno import (
    TurnoCreate,
    TurnoUpdate,
    TurnoEstado,
    TurnoOut,
)

from .receta import (
    RecetaCreate,
    RecetaOut,
)

__all__ = [
    # comunes
    "Page", "DNI", "Telefono", "FechaNacimiento",
    # pacientes
    "PacienteCreate", "PacienteUpdate", "PacienteOut",
    # medicos
    "MedicoCreate", "MedicoUpdate", "MedicoOut",
    # especialidades
    "EspecialidadCreate", "EspecialidadOut",
    # agenda
    "AgendaOut",
    # turnos
    "TurnoCreate", "TurnoUpdate", "TurnoEstado", "TurnoOut",
    # recetas
    "RecetaCreate", "RecetaOut",
]
