# Repositorio Histórico de Carga Lectiva Docente

Sistema web *full-stack* desarrollado para la Escuela Profesional de Ciencias Contables y Financieras. Centraliza y automatiza la extracción, indexación y consulta del historial académico de los docentes a partir de documentos oficiales.

## 📌 El Problema y la Solución

Históricamente, consultar qué asignaturas había dictado un profesor en semestres anteriores requería abrir y revisar de forma manual múltiples documentos PDF independientes. 

Este sistema elimina esa carga operativa: el administrador sube el PDF oficial de cada semestre y el motor del *backend* se encarga de extraer, limpiar y relacionar la información automáticamente. Como resultado, cualquier usuario puede buscar el nombre de un docente y obtener en segundos una tabla consolidada con sus cursos, ciclos, secciones y horas dictadas a lo largo del tiempo.

## 🛠️ Stack Tecnológico

La arquitectura está completamente *dockerizada* para garantizar su reproducibilidad en cualquier entorno sin conflictos de dependencias.

* **Frontend:** React 19, Vite, Tailwind CSS, Recharts (Visualización estadística), jsPDF (Generación de reportes).
* **Backend:** FastAPI (Python 3.12-slim), SQLAlchemy, `pdfplumber` (Motor de parsing heurístico para PDFs tabulares).
* **Base de Datos:** PostgreSQL 17 (Imágenes Alpine-based).
* **Infraestructura:** Docker y Docker Compose.

## 📁 Estructura del Proyecto

```text
sistema-carga-lectiva/
├── backend/            # API REST (FastAPI) y lógica de extracción PDF (Python)
│   ├── app/
│   │   ├── models/     # Modelos ORM de SQLAlchemy
│   │   ├── routes/     # Endpoints (Auth, Upload, Consultas)
│   │   └── services/   # Algoritmos de sanitización de texto y parsing PDF
│   ├── requirements.txt
│   └── Dockerfile
├── database/           
│   └── init.sql        # Esquema inicial DDL relacional
├── frontend/           # SPA (React 19 + Tailwind)
│   ├── src/
│   │   ├── context/    # Estado de autenticación
│   │   └── pages/      # Vistas interactivas (Dashboard, Buscador, Subida)
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml  # Orquestación de contenedores
├── .env.example        # Variables de entorno requeridas
└── .gitignore          
```

## ⚙️ Despliegue Local

El proyecto está diseñado para levantarse con un solo comando, sin instalar dependencias globales en el sistema anfitrión.

**1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/sistema-carga-lectiva.git
cd sistema-carga-lectiva
```

**2. Configurar el entorno**
Crea tu archivo `.env` local basándote en la plantilla de ejemplo. Asegúrate de configurar la cadena de conexión a la base de datos (`DATABASE_URL`).
```bash
cp .env.example .env
```

**3. Levantar los contenedores**
Construye las imágenes y levanta la red interna de Docker. Este comando instalará todas las dependencias aisladas para React (`node_modules`) y FastAPI (`requirements.txt`).
```bash
docker compose up --build
```

**4. Accesos**
* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **API y Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Base de Datos (Interna):** Puerto `5432`

## 🔒 Decisiones de Ingeniería y Arquitectura

* **Extracción Tolerante a Fallos:** El procesador de PDFs detecta y unifica celdas fracturadas por saltos de línea irregulares, descartando mediante diccionarios heurísticos la "basura textual" (títulos como DOCTOR, MAGISTER, cargos administrativos) para persistir nombres puros en la base de datos.
* **Seguridad Antienumeración:** Los *endpoints* de autenticación responden en tiempos constantes y con mensajes genéricos para mitigar ataques de descubrimiento de usuarios válidos.
* **Rendimiento UI:** Implementación de estado aislado mediante subcomponentes. Los historiales grandes (múltiples semestres) cargan colapsados y cada bloque maneja su propia paginación, evitando re-renderizados costosos en el árbol principal de React.

## 🗺️ Próximas Mejoras (Roadmap)

- [ ] Integración de exportación tabular directa a Excel (`.xlsx`).
- [ ] Refactorización de alertas estáticas hacia un sistema de notificaciones flotantes (*Toasts*).
- [ ] Ampliación del esquema de base de datos para soporte multi-facultad.