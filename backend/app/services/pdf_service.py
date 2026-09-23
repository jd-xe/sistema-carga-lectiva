import io
import pdfplumber
from sqlalchemy.orm import Session
from sqlalchemy import text

def extraer_datos_pdf(contenido_pdf: bytes, pdf_id: int, db: Session):
    """
    Lee el PDF en memoria, extrae docentes y asignaturas, 
    y los guarda en la base de datos asociada al pdf_id.
    Retorna la cantidad de registros guardados.
    """
    registros_guardados = 0
    docente_actual_id = None
    
    ignorar = ["SUB TOTAL", "TOTAL", "PREPARACIÓN DE CLASES", "EVALUACIÓN DE CLASES", "ASIGNATURAS"]

    with pdfplumber.open(io.BytesIO(contenido_pdf)) as pdf:
        for pagina in pdf.pages:
            tablas = pagina.extract_tables()
            
            for tabla in tablas:
                for fila in tabla:
                    fila_limpia = [str(celda).strip().replace('\n', ' ') if celda else "" for celda in fila]

                    if len(fila_limpia) >= 9:
                        col_profesor = fila_limpia[1]
                        col_asignatura = fila_limpia[2]
                        col_ep = fila_limpia[3]
                        col_ciclo = fila_limpia[4]
                        col_sec = fila_limpia[5]
                        col_ht = fila_limpia[6] or '0'
                        col_hp = fila_limpia[7] or '0'
                        col_th = fila_limpia[8] or '0'

                        # Actualizar estado del docente
                        texto_profesor = col_profesor.upper().strip()
                        if texto_profesor and texto_profesor != "PROFESOR":
                            nombre_limpio = " ".join(texto_profesor.split())
                            fragmentos_basura = ["-", "--", "AUXILIAR T.C DOCENTE", "DOCTOR", "MAESTRO", "DOCTORA"]
                            
                            if nombre_limpio not in fragmentos_basura and len(nombre_limpio) > 10:
                                nombre_limpio = nombre_limpio.replace("-", "").strip()
                                
                                query_buscar_doc = text("SELECT id FROM docentes WHERE nombre_completo = :nombre")
                                doc_existente = db.execute(query_buscar_doc, {"nombre": nombre_limpio}).fetchone()
                                
                                if doc_existente:
                                    docente_actual_id = doc_existente[0]
                                else:
                                    query_insert_doc = text("""
                                        INSERT INTO docentes (nombre_completo) 
                                        VALUES (:nombre) RETURNING id;
                                    """)
                                    res_nuevo_doc = db.execute(query_insert_doc, {"nombre": nombre_limpio})
                                    docente_actual_id = res_nuevo_doc.fetchone()[0]
                                    db.commit()

                        # Guardar asignatura
                        es_asignatura_valida = col_asignatura and not any(basura in col_asignatura.upper() for basura in ignorar)
                        tiene_datos_academicos = col_ciclo and col_sec

                        if es_asignatura_valida and tiene_datos_academicos and docente_actual_id:
                            query_carga = text("""
                                INSERT INTO carga_lectiva 
                                (pdf_id, docente_id, asignatura, escuela_profesional, ciclo, seccion, ht, hp, th)
                                VALUES (:pdf_id, :docente_id, :asignatura, :ep, :ciclo, :sec, :ht, :hp, :th)
                            """)
                            
                            def to_float(val):
                                try: return float(val)
                                except ValueError: return 0.0

                            db.execute(query_carga, {
                                "pdf_id": pdf_id,
                                "docente_id": docente_actual_id,
                                "asignatura": col_asignatura,
                                "ep": col_ep,
                                "ciclo": col_ciclo,
                                "sec": col_sec,
                                "ht": to_float(col_ht),
                                "hp": to_float(col_hp),
                                "th": to_float(col_th)
                            })
                            registros_guardados += 1

    db.commit()
    return registros_guardados