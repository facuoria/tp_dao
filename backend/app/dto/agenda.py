from pydantic import BaseModel, conint, constr, validator

TIME_RE = r"^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$"

def _to_minutes(t: str) -> int:
    hh, mm = t.split(":")[:2]
    return int(hh) * 60 + int(mm)

def _norm_time(t: str) -> str:
    hh, mm, *rest = t.split(":") + ["0", "0"]
    return f"{int(hh):02d}:{int(mm):02d}"

class AgendaBase(BaseModel):
    dia_semana: conint(ge=0, le=6)
    hora_inicio: constr(pattern=TIME_RE)
    hora_fin: constr(pattern=TIME_RE)
    duracion_min: conint(gt=0)

    _normalize_start = validator("hora_inicio", allow_reuse=True)(_norm_time)
    _normalize_end = validator("hora_fin", allow_reuse=True)(_norm_time)

    @validator("hora_fin")
    def _check_order(cls, v, values):
        hi = values.get("hora_inicio")
        if hi and _to_minutes(v) <= _to_minutes(hi):
            raise ValueError("hora_fin debe ser mayor a hora_inicio")
        return v

    @validator("duracion_min")
    def _check_duration(cls, v, values):
        hi, hf = values.get("hora_inicio"), values.get("hora_fin")
        if hi and hf and v > (_to_minutes(hf) - _to_minutes(hi)):
            raise ValueError("duracion_min excede la franja")
        return v

class AgendaCreate(AgendaBase): pass
class AgendaUpdate(AgendaBase): pass

class AgendaOut(AgendaBase):
    id: int
    medico_id: int
