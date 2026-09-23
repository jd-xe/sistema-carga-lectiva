from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from ..models.schemas import LoginRequest

router = APIRouter(prefix="/api", tags=["Autenticación"])

@router.post("/login")
def login(credenciales: LoginRequest, db: Session = Depends(get_db)):
    try:
        query = text("SELECT nombre, password, estado FROM usuarios WHERE usuario = :user")
        resultado = db.execute(query, {"user": credenciales.usuario}).fetchone()

        mensaje_error = "Usuario o contraseña incorrectos."

        if not resultado:
            return {"status": "error", "mensaje": mensaje_error}

        nombre_real, password_bd, estado = resultado

        if not estado:
            return {"status": "error", "mensaje": "El usuario está inactivo."}

        if credenciales.password == password_bd:
            return {"status": "exito", "nombre": nombre_real}
        else:
            return {"status": "error", "mensaje": mensaje_error}

    except Exception as e:
        return {"status": "error", "detalle": str(e)}