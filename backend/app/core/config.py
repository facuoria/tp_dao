from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Turnero API"
    API_PREFIX: str = "/api"
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_NAME: str = "turnosMedicos"
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"
    FRONTEND_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
