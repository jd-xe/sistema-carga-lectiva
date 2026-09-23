import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });
      const data = await response.json();
      
      if (data.status === 'exito') {
        login(data.nombre);
        navigate('/panel');
      } else {
        setError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans text-slate-800">
      
      {/* Panel Izquierdo */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0B132B] p-12 justify-center items-center relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400 blur-[120px]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="bg-white/5 p-4 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl mb-8">
            <img 
              src="/logo_facultad.png" 
              alt="Logo Facultad" 
              className="h-32 object-contain drop-shadow-lg"
            />
          </div>
          
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Repositorio Histórico de <br/><span className="text-blue-400">Carga Lectiva</span>
          </h1>
          
          <p className="text-slate-300 text-base leading-relaxed mb-12 px-4">
            Sistema centralizado para la gestión, consulta y análisis de la carga académica docente de la Facultad de Ciencias Económicas, Contables y Financieras.
          </p>

          <p className="text-xs text-slate-500 tracking-wider">
            &copy; {new Date().getFullYear()} UNJFSC. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="w-full md:w-1/2 bg-slate-50 flex justify-center items-center p-6 sm:p-12">
        
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 relative">
          
          {/* Logo visible solo en móviles */}
          <div className="md:hidden flex justify-center mb-8">
            <img src="/logo_facultad.png" alt="Logo" className="h-20 object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Bienvenido</h2>
            <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales administrativas.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-wide uppercase mb-2">Usuario</label>
              <input 
                type="text" 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej. jsantos"
                className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 font-medium" 
                required
                disabled={cargando}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-wide uppercase mb-2">Contraseña</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 font-medium" 
                required
                disabled={cargando}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium flex items-start gap-2 mt-1">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={cargando}
              className="mt-4 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {cargando ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verificando...
                </>
              ) : 'Acceder al Sistema'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Repositorio Digital &copy; {new Date().getFullYear()} <span className="text-slate-600 font-semibold">| Ciencias Contables y Financieras</span>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}