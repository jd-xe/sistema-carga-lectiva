from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import auth, docentes, pdfs

app = FastAPI(title="API Carga Lectiva")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Módulos
app.include_router(auth.router)
app.include_router(docentes.router)
app.include_router(pdfs.router)

@app.get("/")
def read_root():
    return {"mensaje": "¡Bienvenido a la API del Sistema de Carga Lectiva!"}