import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import AdminDashboard from './pages/AdminDashboard';
import ClientesAdmin from './pages/ClientesAdmin';
import RecargasAdmin from './pages/RecargasAdmin';
import ReportesAdmin from './pages/ReportesAdmin';
import ClienteDashboard from './pages/ClienteDashboard';


function App() {
  return (
    // Contenedor global: Fondo sutil, tipografía limpia y prevención de desbordes en móviles
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-200">
      <Router>
        {/* main: Centra el contenido en pantallas gigantes y usa todo el ancho en celulares */}
        <main className="w-full max-w-7xl mx-auto flex flex-col min-h-screen">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/clientes" element={<ClientesAdmin />} />
            <Route path="/admin/recargas" element={<RecargasAdmin />} />
            <Route path="/admin/reportes" element={<ReportesAdmin />} />
            <Route path="/cliente" element={<ClienteDashboard />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;