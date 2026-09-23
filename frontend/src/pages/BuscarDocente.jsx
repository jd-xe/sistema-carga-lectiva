import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Sub-componente para aislar el estado (paginación y colapso) por cada semestre
const TablaSemestre = ({ periodo, cursos, busquedaLocal, isOpenByDefault }) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [expandido, setExpandido] = useState(isOpenByDefault);
  const registrosPorPagina = 10;

  // Reinicia la paginación si el usuario utiliza el filtro rápido
  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaLocal]);

  const filtrados = cursos.filter(c => 
    c.docente.toLowerCase().includes(busquedaLocal.toLowerCase()) || 
    c.asignatura.toLowerCase().includes(busquedaLocal.toLowerCase())
  );
  
  if (filtrados.length === 0) return null;

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const registrosPaginados = filtrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(filtrados.length / registrosPorPagina);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white transition-all duration-300">
      
      {/* Cabecera Colapsable */}
      <div 
        onClick={() => setExpandido(!expandido)}
        className="bg-gray-100 hover:bg-gray-200 cursor-pointer px-6 py-4 border-b border-gray-200 flex justify-between items-center transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expandido ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          <h4 className="font-bold text-gray-800">Semestre Académico: <span className="text-blue-600">{periodo}</span></h4>
        </div>
        <span className="text-xs bg-white border border-gray-300 text-gray-700 font-bold px-3 py-1 rounded-full shadow-sm">
          {filtrados.length} registros
        </span>
      </div>
      
      {/* Grid de Datos y Paginador Independiente */}
      {expandido && (
        <div className="animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wider border-b border-gray-200">
                  <th className="p-3 pl-6">Docente</th>
                  <th className="p-3">Asignatura</th>
                  <th className="p-3 text-center">Ciclo</th>
                  <th className="p-3 text-center">Sec</th>
                  <th className="p-3 text-center">TH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrosPaginados.map((curso, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 pl-6 font-bold text-gray-800 text-xs">{curso.docente}</td>
                    <td className="p-3 font-medium text-gray-700">{curso.asignatura}</td>
                    <td className="p-3 text-center">{curso.ciclo}</td>
                    <td className="p-3 text-center font-bold text-blue-600">{curso.seccion}</td>
                    <td className="p-3 text-center font-bold">{curso.th}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-between items-center px-6">
              <span className="text-xs text-gray-500">Página <strong className="text-gray-700">{paginaActual}</strong> de {totalPaginas}</span>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setPaginaActual(p => Math.max(1, p - 1)); }} 
                  disabled={paginaActual === 1}
                  className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Anterior
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setPaginaActual(p => Math.min(totalPaginas, p + 1)); }} 
                  disabled={paginaActual === totalPaginas}
                  className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function BuscarDocente() {
  const [nombre, setNombre] = useState('');
  const [semestre, setSemestre] = useState('');
  const [ciclo, setCiclo] = useState('');
  const [curso, setCurso] = useState('');
  
  const [semestresDisponibles, setSemestresDisponibles] = useState([]);
  const [busquedaLocal, setBusquedaLocal] = useState('');

  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState({ loading: false, error: '' });

  // Carga inicial de filtros dinámicos
  useEffect(() => {
    fetch('http://localhost:8000/api/semestres-disponibles')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'exito') setSemestresDisponibles(data.semestres);
      })
      .catch(err => console.error("Error cargando semestres:", err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setEstado({ loading: true, error: '' });
    setDatos(null);
    setBusquedaLocal(''); 

    try {
      const params = new URLSearchParams();
      if (nombre.trim()) params.append('nombre', nombre.trim());
      if (semestre) params.append('semestre', semestre);
      if (ciclo) params.append('ciclo', ciclo);
      if (curso.trim()) params.append('curso', curso.trim());

      const res = await fetch(`http://localhost:8000/api/buscar-docente?${params.toString()}`);
      const data = await res.json();

      if (data.status === 'exito') setDatos(data);
      else setEstado({ loading: false, error: data.mensaje || 'No se encontraron registros.' });
    } catch (err) {
      setEstado({ loading: false, error: 'Error de conexión con el servidor.' });
    } finally {
      setEstado((prev) => ({ ...prev, loading: false }));
    }
  };

  const generarPDF = () => {
    if (!datos || !datos.resultados) return;

    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Template del Reporte Institucional
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("UNIVERSIDAD NACIONAL JOSÉ FAUSTINO SÁNCHEZ CARRIÓN", pageWidth / 2, 18, { align: "center" }); 
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("FACULTAD DE CIENCIAS ECONÓMICAS, CONTABLES Y FINANCIERAS", pageWidth / 2, 23, { align: "center" }); 
    doc.text("ESCUELA PROFESIONAL DE CIENCIAS CONTABLES Y FINANCIERAS", pageWidth / 2, 28, { align: "center" }); 
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 33, pageWidth - 14, 33);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 38, 110); 
    doc.text("REPORTE HISTÓRICO DE CARGA LECTIVA", pageWidth / 2, 42, { align: "center" }); 

    doc.setFillColor(245, 247, 250); 
    doc.roundedRect(14, 48, pageWidth - 28, 16, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("CRITERIOS DE BÚSQUEDA:", 18, 54);
    doc.setFont("helvetica", "normal");
    doc.text(`Docente: ${nombre || 'Todos'}   |   Semestre: ${semestre || 'Todos'}   |   Ciclo: ${ciclo || 'Todos'}   |   Curso: ${curso || 'Todos'}`, 68, 54);

    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN GLOBAL:", 18, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Docentes: ${datos.resumen.total_docentes}   |   Total Cursos: ${datos.resumen.total_cursos_dictados}   |   Total Horas (TH): ${datos.resumen.total_horas_historicas}`, 55, 60);

    let yPos = 72;

    Object.entries(datos.resultados).forEach(([periodo, cursosPeriodo]) => {
      // Prevención de desbordamiento de página
      if (yPos > 170) { 
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Semestre Académico: ${periodo}`, 14, yPos);
      
      const filas = cursosPeriodo.map(c => [
        c.docente,
        c.asignatura,
        c.escuela,
        c.ciclo,
        c.seccion,
        c.ht,
        c.hp,
        c.th
      ]);

      autoTable(doc, {
        startY: yPos + 4,
        head: [['Docente', 'Asignatura', 'Escuela Profesional', 'Ciclo', 'Sec', 'HT', 'HP', 'TH']],
        body: filas,
        theme: 'striped', 
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', halign: 'center', valign: 'middle' },
        bodyStyles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 75 }, 1: { cellWidth: 65 }, 2: { cellWidth: 55 }, 
          3: { cellWidth: 12, halign: 'center' }, 4: { cellWidth: 12, halign: 'center' }, 
          5: { cellWidth: 12, halign: 'center' }, 6: { cellWidth: 12, halign: 'center' }, 
          7: { cellWidth: 12, halign: 'center', fontStyle: 'bold' } 
        },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15; 
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      doc.text("Sistema de Gestión de Carga Lectiva - FCECYF", 14, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`Reporte_Carga_Lectiva_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Consulta Histórica de Carga Lectiva</h2>
      <p className="text-gray-500 mb-6">Explora y filtra la información del repositorio académico institucional.</p>

      <form onSubmit={handleSearch} className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Docente (Opcional)</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: TORRES" className="w-full p-2.5 rounded-lg border border-gray-300 outline-none uppercase" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Semestre</label>
            <select value={semestre} onChange={(e) => setSemestre(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 outline-none">
              <option value="">Todos</option>
              {semestresDisponibles.map(sem => <option key={sem} value={sem}>{sem}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Ciclo</label>
            <select value={ciclo} onChange={(e) => setCiclo(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 outline-none">
              <option value="">Todos</option>
              {[1,2,3,4,5,6,7,8,9,10].map(c => <option key={c} value={c}>Ciclo {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Curso (Opcional)</label>
            <input type="text" value={curso} onChange={(e) => setCurso(e.target.value)} placeholder="Ej: CONTABILIDAD" className="w-full p-2.5 rounded-lg border border-gray-300 outline-none uppercase" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={estado.loading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md disabled:bg-gray-400 transition-colors">
            {estado.loading ? 'Consultando...' : 'Realizar Consulta'}
          </button>
        </div>
      </form>

      {estado.error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border-l-4 border-red-500 mb-6 font-medium">{estado.error}</div>}

      {datos && datos.resultados && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex-1 min-w-[250px]">
              <input 
                type="text" 
                placeholder="🔍 Filtrar rápido por docente o curso..." 
                value={busquedaLocal}
                onChange={(e) => setBusquedaLocal(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center"><span className="block text-gray-500 text-xs uppercase">Docentes</span> <strong className="text-xl text-gray-800">{datos.resumen.total_docentes}</strong></div>
              <div className="text-center"><span className="block text-gray-500 text-xs uppercase">Cursos Totales</span> <strong className="text-xl text-gray-800">{datos.resumen.total_cursos_dictados}</strong></div>

              <button 
                onClick={generarPDF}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                📄 Descargar Reporte
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {Object.entries(datos.resultados).map(([periodo, cursos], index) => (
              <TablaSemestre 
                key={periodo} 
                periodo={periodo} 
                cursos={cursos} 
                busquedaLocal={busquedaLocal}
                // Expande solo el periodo más reciente por defecto para optimizar la visualización
                isOpenByDefault={index === 0} 
              />
            ))}
          </div>

        </div>
      )}
    </div>
  );
}