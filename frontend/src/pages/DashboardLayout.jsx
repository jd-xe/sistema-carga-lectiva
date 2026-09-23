import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { usuarioActivo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
      location.pathname === path
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
        : 'text-slate-400 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      <aside className="w-72 bg-[#0B132B] flex flex-col shadow-2xl z-20 relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-blue-600 opacity-5 blur-[100px] pointer-events-none"></div>

        <div className="p-8 border-b border-white/10 flex flex-col items-center">
          <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/10 mb-4">
            <img src="/logo_facultad.png" alt="Logo" className="h-16 object-contain" />
          </div>
          <h2 className="text-lg font-bold text-white text-center leading-tight">
            Repositorio de <br/><span className="text-blue-400">Carga Lectiva</span>
          </h2>
        </div>
        
        {/* Navegación */}
        <nav className="flex-1 p-5 flex flex-col gap-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Menú Principal</p>
          
          <Link to="/panel" className={menuClass('/panel')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Inicio
          </Link>
          
          <Link to="/panel/subir-pdf" className={menuClass('/panel/subir-pdf')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Subir Documento
          </Link>
          
          <Link to="/panel/buscar-docente" className={menuClass('/panel/buscar-docente')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Buscador Global
          </Link>
        </nav>
        
        {/* Botón de Salida */}
        <div className="p-5 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              {usuarioActivo ? usuarioActivo.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{usuarioActivo}</p>
              <p className="text-xs text-slate-400">Administrador</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-red-500/90 text-slate-300 hover:text-white rounded-xl font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center z-10 sticky top-0">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Panel de Administración</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Facultad de Ciencias Económicas, Contables y Financieras</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}