# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import get_api_router   # <--- acá

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.FRONTEND_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monta todos los routers en /api (o el prefijo que tengas)
app.include_router(get_api_router(), prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {"ok": True, "name": settings.APP_NAME}
