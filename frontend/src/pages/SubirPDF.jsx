import { useState } from 'react';

export default function SubirPDF() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [semestre, setSemestre] = useState('I');
  const [file, setFile] = useState(null);
  const [estado, setEstado] = useState({ loading: false, error: '', exito: '', cursos: 0 });
  
  const [isDragging, setIsDragging] = useState(false);

  const procesarArchivoSeleccionado = (seleccionado) => {
    if (seleccionado.type !== 'application/pdf') {
      setEstado({ ...estado, error: 'Por favor, selecciona un archivo PDF válido.', exito: '' });
      setFile(null);
      return;
    }
    setFile(seleccionado);
    setEstado({ ...estado, error: '', exito: '' });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      procesarArchivoSeleccionado(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarArchivoSeleccionado(e.dataTransfer.files[0]);
      e.dataTransfer.clearData(); // Limpia el buffer del navegador
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setEstado({ ...estado, error: 'Debes seleccionar un archivo PDF.' });
      return;
    }

    setEstado({ loading: true, error: '', exito: '', cursos: 0 });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:8000/api/upload-pdf?anio=${anio}&semestre=${semestre}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.status === 'exito') {
        setEstado({
          loading: false,
          error: '',
          exito: `¡Procesamiento completado! Se han extraído y guardado los registros correctamente.`,
          cursos: data.cursos_guardados
        });
        setFile(null); // Limpiar el archivo tras el éxito
      } else {
        setEstado({ loading: false, error: data.detalle || 'Error al procesar el archivo.', exito: '', cursos: 0 });
      }
    } catch (err) {
      setEstado({ loading: false, error: 'Error de conexión con el servidor. Verifica que el backend esté encendido.', exito: '', cursos: 0 });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-800">Digitalizar Carga Lectiva</h2>
        <p className="text-slate-500 mt-1">Sube el documento PDF oficial emitido por la facultad arrastrándolo a la zona de carga o haciendo clic en ella.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Controles de Periodo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Año Académico</label>
              <input 
                type="number" 
                value={anio} 
                onChange={(e) => setAnio(e.target.value)} 
                min="2000" max="2100"
                className="w-full p-3.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-700"
                required
                disabled={estado.loading}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Semestre</label>
              <select 
                value={semestre} 
                onChange={(e) => setSemestre(e.target.value)}
                className="w-full p-3.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-700"
                disabled={estado.loading}
              >
                <option value="I">Semestre I</option>
                <option value="II">Semestre II</option>
              </select>
            </div>
          </div>

          {/* Zona de Carga de Archivo */}
          <div className="relative">
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              className="hidden" 
              id="file-upload"
              disabled={estado.loading}
            />
            <label 
              htmlFor="file-upload" 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 
                ${isDragging 
                  ? 'border-blue-600 bg-blue-100/50 scale-[1.02]' // Efecto visual al arrastrar encima
                  : file 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                } 
                ${estado.loading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                {file ? (
                  <>
                    <svg className={`w-16 h-16 text-blue-500 mb-4 transition-transform ${isDragging ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <p className="mb-2 text-lg font-bold text-slate-700 truncate max-w-xs">{file.name}</p>
                    <p className="text-sm text-blue-600 font-medium">
                      {isDragging ? '¡Suelta el archivo aquí para reemplazarlo!' : 'Click o arrastra para cambiar archivo'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center mb-4 border transition-colors ${isDragging ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-100'}`}>
                      <svg className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </div>
                    <p className={`mb-2 text-lg font-bold ${isDragging ? 'text-blue-700' : 'text-slate-700'}`}>
                      {isDragging ? '¡Suelta el PDF aquí!' : 'Haz clic o arrastra un PDF aquí'}
                    </p>
                    <p className="text-sm text-slate-500">Solo se admiten archivos en formato .pdf (Ej: Carga_2026.pdf)</p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Alertas */}
          {estado.error && (
            <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium flex items-center gap-3 animate-fade-in">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {estado.error}
            </div>
          )}

          {estado.exito && (
            <div className="p-5 bg-green-50 text-green-700 border border-green-200 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between animate-fade-in">
              <div className="flex items-center gap-3 font-medium">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <p className="font-bold text-green-800">¡Extracción Exitosa!</p>
                  <p className="text-sm">{estado.exito}</p>
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg border border-green-200 text-center shadow-sm whitespace-nowrap">
                <span className="block text-2xl font-black text-green-600">{estado.cursos}</span>
                <span className="text-[10px] font-bold text-green-800 uppercase tracking-widest">Registros</span>
              </div>
            </div>
          )}

          {/* Botón de Envío */}
          <button 
            type="submit" 
            disabled={estado.loading || !file}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex justify-center items-center gap-2 ${estado.loading || !file ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5'}`}
          >
            {estado.loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Procesando Documento (Esto puede tardar)...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Procesar e Importar Datos
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}