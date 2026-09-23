import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome'; 
import SubirPDF from './pages/SubirPDF';
import BuscarDocente from './pages/BuscarDocente';

const RutaPrivada = ({ children }) => {
  const { usuarioActivo } = useAuth();
  return usuarioActivo ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/panel" element={<RutaPrivada><DashboardLayout /></RutaPrivada>}>
            
            <Route index element={<DashboardHome />} />
            
            <Route path="subir-pdf" element={<SubirPDF />} />
            <Route path="buscar-docente" element={<BuscarDocente />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;