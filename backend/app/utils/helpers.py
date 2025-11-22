from datetime import datetime


def parse_datetime_value(value):
    if isinstance(value, datetime):
        return value
    if value is None:
        raise ValueError("La fecha y hora son obligatorias")

    if isinstance(value, str):
        try:
            if "T" in value:
                return datetime.fromisoformat(value)
            try:
                return datetime.strptime(value, "%Y-%m-%d %H:%M")
            except ValueError:
                return datetime.strptime(value, "%d/%m/%Y %H:%M")
        except ValueError as exc:
            raise ValueError("Formato de fecha y hora invalido. Usa AAAA-MM-DDTHH:MM.") from exc

    raise ValueError("Formato de fecha no soportado")
