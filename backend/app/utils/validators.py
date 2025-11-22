from fastapi import HTTPException


def require_value(value, field_name: str, message: str):
    if value is None or (isinstance(value, str) and value.strip() == ""):
        raise HTTPException(status_code=400, detail=message or f"Falta el campo obligatorio: {field_name}")
    return value


def require_int(value, field_name: str, empty_message: str, invalid_message: str):
    if value is None or (isinstance(value, str) and str(value).strip() == ""):
        raise HTTPException(status_code=400, detail=empty_message)
    try:
        return int(value)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail=invalid_message)


def optional_int(value):
    if value is None or (isinstance(value, str) and str(value).strip() == ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="El valor debe ser numerico")
