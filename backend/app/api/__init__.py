# backend/app/api/__init__.py
"""
Helper para montar todos los routers de una.
"""
from fastapi import APIRouter
from .routers import pacientes, medicos, especialidades, turnos, recetas

def get_api_router() -> APIRouter:
    router = APIRouter()
    router.include_router(pacientes.router)
    router.include_router(medicos.router)
    router.include_router(especialidades.router)
    router.include_router(turnos.router)
    router.include_router(recetas.router)
    return router

__all__ = ["get_api_router"]
