import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.db_host: str = os.getenv("DB_HOST", "localhost")
        self.db_port: int = int(os.getenv("DB_PORT", "3306"))
        self.db_user: str = os.getenv("DB_USER", "root")
        self.db_password: str = os.getenv("DB_PASSWORD", "rolpa")
        self.db_name: str = os.getenv("DB_NAME", "turnosMedicos")

        # Email Settings
        self.mail_username: str = os.getenv("MAIL_USERNAME", "grupeterasgpt@gmail.com")
        self.mail_password: str = os.getenv("MAIL_PASSWORD", "grupeteras2022")
        self.mail_from: str = os.getenv("MAIL_FROM", "noreply@example.com")
        self.mail_port: int = int(os.getenv("MAIL_PORT", "587"))
        self.mail_server: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
        self.mail_from_name: str = os.getenv("MAIL_FROM_NAME", "Turnos Medicos")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
