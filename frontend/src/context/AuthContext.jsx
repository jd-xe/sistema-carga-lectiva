import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    return localStorage.getItem('usuario_carga_lectiva') || null;
  });

  const login = (nombre) => {
    setUsuarioActivo(nombre);
    localStorage.setItem('usuario_carga_lectiva', nombre);
  };

  const logout = () => {
    setUsuarioActivo(null);
    localStorage.removeItem('usuario_carga_lectiva');
  };

  return (
    <AuthContext.Provider value={{ usuarioActivo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);