from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from ..database import get_db
from ..services.pdf_service import extraer_datos_pdf

router = APIRouter(prefix="/api", tags=["Gestión de PDFs"])

@router.post("/upload-pdf")
async def upload_pdf(anio: int, semestre: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        query_pdf = text("""
            INSERT INTO pdf_cargas (anio, semestre, nombre_archivo, ruta_archivo)
            VALUES (:anio, :semestre, :nombre_archivo, 'RAM')
            RETURNING id;
        """)
        try:
            resultado_pdf = db.execute(query_pdf, {"anio": anio, "semestre": semestre, "nombre_archivo": file.filename})
            pdf_id = resultado_pdf.fetchone()[0]
            db.commit()
        except IntegrityError:
            db.rollback()
            return {"status": "error", "detalle": "El PDF de este semestre ya fue subido."}

        contenido = await file.read()
        registros_guardados = extraer_datos_pdf(contenido, pdf_id, db)
        
        return {
            "archivo": file.filename, "semestre": f"{anio}-{semestre}",
            "status": "exito", "cursos_guardados": registros_guardados
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "detalle": str(e)}