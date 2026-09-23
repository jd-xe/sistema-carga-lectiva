import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardHome() {
  const [estadisticas, setEstadisticas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/estadisticas')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'exito') setEstadisticas(data.data);
      })
      .catch(err => console.error("Error cargando estadísticas:", err));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-3 relative z-10">¡Bienvenido al Repositorio Institucional!</h2>
        <p className="text-slate-500 text-lg max-w-2xl relative z-10">
          Gestiona, consulta y analiza la carga lectiva docente de la facultad centralizando la información en un solo lugar.
        </p>
        
        <div className="mt-8 flex flex-wrap gap-6 relative z-10">
          <Link to="/panel/subir-pdf" className="group block p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 w-72">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">Digitalizar Carga</h3>
            <p className="text-sm text-slate-500 mt-2">Sube el PDF oficial para extracción automática.</p>
          </Link>

          <Link to="/panel/buscar-docente" className="group block p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 w-72">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">Consulta Histórica</h3>
            <p className="text-sm text-slate-500 mt-2">Filtra y cruza variables de todo el repositorio.</p>
          </Link>
        </div>
      </div>

      {/* Panel de Gráficos Estadísticos */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Análisis de Crecimiento Lectivo
        </h3>
        
        {estadisticas.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estadisticas} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Bar dataKey="Cursos" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Horas" fill="#818CF8" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 w-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No hay suficientes datos para generar el gráfico. Por favor digitaliza un periodo primero.</p>
          </div>
        )}
      </div>
    </div>
  );
}