import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, LogOut, Plus, Users, BarChart, Package, Bell, User } from 'lucide-react';

// Aquí importamos el módulo de clientes y todos los demás componentes correctamente
import ClientesAdmin from './ClientesAdmin';
import RecargasAdmin from './RecargasAdmin';
import ReportesAdmin from './ReportesAdmin';
import CatalogoAdmin from './CatalogoAdmin';
import AdminNotificaciones from './AdminNotificaciones';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario')) || { nombre: 'Administrador Principal', rol: 'Admin' };
  
  const [activeMenu, setActiveMenu] = useState('notificaciones');

  const menuItems = [
    { id: 'recargas', label: 'Registrar Recarga', icon: Plus },
    { id: 'clientes', label: 'Gestión Clientes', icon: Users },
    { id: 'reportes', label: 'Reportes y Búsqueda', icon: BarChart },
    { id: 'catalogo', label: 'Catálogo de Productos', icon: Package },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  ];

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  // Esta función decide qué componente mostrar según el menú seleccionado
  const renderContent = () => {
    switch (activeMenu) {
      case 'notificaciones': 
        return <AdminNotificaciones />;
      case 'clientes': 
        return <ClientesAdmin />;
      case 'recargas':               
        return <RecargasAdmin />; 
      case 'reportes':               
        return <ReportesAdmin />;  
      case 'catalogo':               
        return <CatalogoAdmin />; 
      default: 
        return (
          <div className="bg-white p-8 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Módulo en construcción...</h2>
            <p className="text-slate-500 mt-2">Aquí integraremos los módulos del sistema de Agua.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Cabecera idéntica al diseño */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-1.5 flex items-center justify-center">
            <Droplet className="h-6 w-6 text-white fill-white" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">CLEAN WATER</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-slate-800">{usuario.nombre}</span>
              <span className="text-slate-500 text-xs capitalize">{usuario.rol}</span>
            </div>
          </div>
          <button onClick={cerrarSesion} className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 font-medium transition-colors">
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 flex flex-col md:flex-row gap-6">
        
        {/* Barra Lateral */}
        <aside className="w-full md:w-72 bg-white rounded-xl border border-slate-200 h-fit shrink-0">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-base">Panel de Control</h2>
            <p className="text-xs text-slate-500 mt-0.5">Módulos administrativos</p>
          </div>
          <nav className="p-3 flex flex-col gap-1">
            {menuItems.map(item => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors w-full text-left
                    ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Área de Contenido */}
        <section className="flex-1">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;