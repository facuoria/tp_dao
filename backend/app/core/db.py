from contextlib import contextmanager
import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
from app.core.config import settings

_pool: MySQLConnectionPool | None = None

def init_pool():
    global _pool
    if _pool is None:
        _pool = MySQLConnectionPool(
            pool_name="turnero_pool",
            pool_size=10,
            pool_reset_session=True,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
            autocommit=False,
        )

@contextmanager
def get_conn():
    if _pool is None:
        init_pool()
    cnx = _pool.get_connection()
    try:
        yield cnx
        cnx.commit()
    except:
        cnx.rollback()
        raise
    finally:
        cnx.close()

def fetch_all(sql: str, params: tuple | dict = ()):
    with get_conn() as cnx:
        cur = cnx.cursor(dictionary=True)
        cur.execute(sql, params)
        return cur.fetchall()

def fetch_one(sql: str, params: tuple | dict = ()):
    with get_conn() as cnx:
        cur = cnx.cursor(dictionary=True)
        cur.execute(sql, params)
        return cur.fetchone()

def execute(sql: str, params: tuple | dict = ()):
    with get_conn() as cnx:
        cur = cnx.cursor()
        cur.execute(sql, params)
        last_id = cur.lastrowid
        return last_id

def executemany(sql: str, seq_of_params: list[tuple] | list[dict]):
    with get_conn() as cnx:
        cur = cnx.cursor()
        cur.executemany(sql, seq_of_params)
        return cur.rowcount
