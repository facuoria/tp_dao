from fastapi import HTTPException

def ensure_found(row, msg="Not found"):
    if not row:
        raise HTTPException(status_code=404, detail=msg)

def map_estado_to_name(row):
    # espera SELECT ... , et.nombre AS estado
    if "estado" in row:
        return row
    if "nombre" in row:
        row["estado"] = row["nombre"]
        del row["nombre"]
    return row
