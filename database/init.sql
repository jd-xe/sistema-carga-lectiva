CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'consulta',
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pdf_cargas (
    id SERIAL PRIMARY KEY,
    anio INTEGER NOT NULL,
    semestre VARCHAR(2) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (anio, semestre)
);

CREATE TABLE docentes (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL UNIQUE,
    categoria VARCHAR(100),
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE carga_lectiva (
    id SERIAL PRIMARY KEY,
    pdf_id INTEGER REFERENCES pdf_cargas(id) ON DELETE CASCADE,
    docente_id INTEGER REFERENCES docentes(id) ON DELETE CASCADE,
    asignatura VARCHAR(255) NOT NULL,
    escuela_profesional VARCHAR(255),
    ciclo VARCHAR(20),
    seccion VARCHAR(20),
    ht DECIMAL(5,2) DEFAULT 0,
    hp DECIMAL(5,2) DEFAULT 0,
    th DECIMAL(5,2) DEFAULT 0
);
