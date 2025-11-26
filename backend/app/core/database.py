import mysql.connector
from mysql.connector import pooling
from mysql.connector import Error

from .config import settings


class DatabaseSingleton:
    _instance = None

    def __new__(cls):
        # Si no existe instancia, la creo
        if cls._instance is None:
            cls._instance = super().__new__(cls)

            # CREO EL POOL UNA SOLA VEZ (Singleton real)
            cls._instance.pool = pooling.MySQLConnectionPool(
                pool_name="turnero_pool",
                pool_size=5,
                host=settings.db_host,
                port=settings.db_port,
                user=settings.db_user,
                password=settings.db_password,
                database=settings.db_name,
                autocommit=False,
                charset="utf8"
            )
        return cls._instance

    def get_connection(self):
        return self.pool.get_connection()


# Instancia única global → SINGLETON REAL
_db_singleton = DatabaseSingleton()


# FUNCIÓN COMPATIBLE (NO TOCÁS NADA EN EL RESTO DEL PROYECTO)
def get_connection():
    """
    Mantiene la compatibilidad total con el proyecto actual.
    Cada llamada devuelve una conexión del pool Singleton.
    """
    return _db_singleton.get_connection()


def test_connection():
    try:
        with get_connection() as conn, conn.cursor() as cur:
            cur.execute("SELECT DATABASE(), VERSION()")
            print("Conectado a:", cur.fetchone())
    except Error as e:
        print("Error de conexion:", e)
        raise
