"""
Modelos (dataclasses) que representan filas de la BD.
Se re-exportan para imports más limpios:
    from app.models import PacienteModel, MedicoModel
"""
from .paciente import PacienteModel
from .medico import MedicoModel
from .especialidad import EspecialidadModel
from .agenda import AgendaModel
from .turno import TurnoModel
from .receta import RecetaModel

__all__ = [
    "PacienteModel",
    "MedicoModel",
    "EspecialidadModel",
    "AgendaModel",
    "TurnoModel",
    "RecetaModel",
]
