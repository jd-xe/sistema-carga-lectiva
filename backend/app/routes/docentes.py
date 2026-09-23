from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from ..database import get_db

router = APIRouter(prefix="/api", tags=["Docentes"])

@router.get("/semestres-disponibles")
def obtener_semestres(db: Session = Depends(get_db)):
    try:
        query = text("SELECT DISTINCT anio, semestre FROM pdf_cargas ORDER BY anio DESC, semestre DESC;")
        resultados = db.execute(query).fetchall()
        
        semestres = [f"{fila[0]}-{fila[1]}" for fila in resultados]
        return {"status": "exito", "semestres": semestres}
    except Exception as e:
        return {"status": "error", "detalle": str(e)}

@router.get("/estadisticas")
def obtener_estadisticas(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT p.anio, p.semestre, COUNT(c.id) as total_cursos, SUM(c.th) as total_horas
            FROM pdf_cargas p
            JOIN carga_lectiva c ON p.id = c.pdf_id
            GROUP BY p.anio, p.semestre
            ORDER BY p.anio ASC, p.semestre ASC;
        """)
        resultados = db.execute(query).fetchall()
        
        datos_grafico = [
            {
                "name": f"{fila[0]}-{fila[1]}",
                "Cursos": fila[2],
                "Horas": float(fila[3]) if fila[3] else 0
            }
            for fila in resultados
        ]
        return {"status": "exito", "data": datos_grafico}
    except Exception as e:
        return {"status": "error", "detalle": str(e)}
    
@router.get("/buscar-docente")
def buscar_docente(
    nombre: Optional[str] = Query(None, description="Nombre del docente"),
    semestre: Optional[str] = Query(None, description="Ej: 2026-II"),
    curso: Optional[str] = Query(None, description="Nombre de la asignatura"),
    ciclo: Optional[str] = Query(None, description="Número del ciclo"),
    db: Session = Depends(get_db)
):
    try:
        # 1. Consulta base
        base_query = """
            SELECT 
                d.nombre_completo AS docente, c.asignatura, c.escuela_profesional,
                c.ciclo, c.seccion, c.ht, c.hp, c.th, p.anio, p.semestre
            FROM docentes d
            JOIN carga_lectiva c ON d.id = c.docente_id
            JOIN pdf_cargas p ON c.pdf_id = p.id
            WHERE 1=1
        """
        
        parametros = {}
        filtros_sql = []

        # 2. Filtros dinámicos
        if nombre:
            filtros_sql.append("d.nombre_completo ILIKE :nombre")
            parametros["nombre"] = f"%{nombre}%"
            
        if semestre:
            # Dividir "2026-II" en año y semestre
            partes = semestre.split("-")
            if len(partes) == 2:
                filtros_sql.append("p.anio = :anio AND p.semestre = :sem")
                parametros["anio"] = partes[0]
                parametros["sem"] = partes[1]

        if curso:
            filtros_sql.append("c.asignatura ILIKE :curso")
            parametros["curso"] = f"%{curso}%"
            
        if ciclo and ciclo != "Todos":
            filtros_sql.append("c.ciclo = :ciclo")
            parametros["ciclo"] = str(ciclo)

        # Unir todos los filtros a la consulta base
        if filtros_sql:
            base_query += " AND " + " AND ".join(filtros_sql)
            
        base_query += " ORDER BY p.anio DESC, p.semestre DESC, d.nombre_completo ASC, c.ciclo ASC;"
        
        query = text(base_query)
        resultados = db.execute(query, parametros).fetchall()
        
        if not resultados:
            return {"status": "info", "mensaje": "No se encontraron registros que coincidan con los filtros."}

        # 3. Estructurar la respuesta
        historial_global = {}
        total_cursos = 0
        total_horas = 0
        docentes_unicos = set()
        
        for fila in resultados:
            docente = fila[0]
            periodo = f"{fila[8]}-{fila[9]}"
            docentes_unicos.add(docente)
            
            if periodo not in historial_global:
                historial_global[periodo] = []
                
            historial_global[periodo].append({
                "docente": docente,
                "asignatura": fila[1], 
                "escuela": fila[2], 
                "ciclo": fila[3],
                "seccion": fila[4], 
                "ht": float(fila[5]), 
                "hp": float(fila[6]), 
                "th": float(fila[7])
            })
            total_cursos += 1
            total_horas += float(fila[7])

        return {
            "status": "exito",
            "tipo_busqueda": "global" if not nombre else "individual",
            "resumen": {
                "total_docentes": len(docentes_unicos),
                "total_cursos_dictados": total_cursos, 
                "total_horas_historicas": total_horas
            },
            "resultados": historial_global
        }
    except Exception as e:
        return {"status": "error", "detalle": str(e)}


