import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Droplet, Bell, Gift, Clock, Home, CheckCircle, LogOut, Package, ShoppingCart } from 'lucide-react';

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  
  const [activeTab, setActiveTab] = useState('inicio');
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalRecargas, setTotalRecargas] = useState(0);
  const [historialRecargas, setHistorialRecargas] = useState([]);
  const [productosCatalogo, setProductosCatalogo] = useState([]); // <--- Estado para los productos reales
  const [mensajeAlerta, setMensajeAlerta] = useState('');

  useEffect(() => {
    cargarDatosCliente();
    cargarCatalogo();
  }, []);

  const cargarDatosCliente = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('https://backend-clearwater.onrender.com/api/clientes/perfil-datos', config);
      
      setTotalRecargas(response.data.totalRecargas);
      setNotificaciones(response.data.notificaciones);
      setHistorialRecargas(response.data.recargas || []);
    } catch (error) {
      console.error('Error al cargar datos del cliente', error);
    }
  };

  const cargarCatalogo = async () => {
    try {
      // Cargamos el catálogo de productos real de la base de datos
      const response = await axios.get('https://backend-clearwater.onrender.com/api/productos');
      setProductosCatalogo(response.data);
    } catch (error) {
      console.error('Error al cargar el catálogo', error);
    }
  };

  // Función para solicitar un producto y notificar al administrador
  const solicitarProducto = async (producto) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Mensaje formateado claramente para que el admin lo identifique de inmediato
      const mensajeNoti = `PEDIDO_PRODUCTO: ${producto.nombre} (Precio: $${Number(producto.precio).toFixed(2)})`;

      await axios.post('https://backend-clearwater.onrender.com/api/notificaciones', {
        usuario_id: usuario.id,
        mensaje: mensajeNoti
      }, config);

      setMensajeAlerta(`¡Solicitud enviada! El administrador ha sido notificado sobre tu interés en ${producto.nombre}.`);
      setTimeout(() => setMensajeAlerta(''), 5000);
    } catch (error) {
      console.error('Error al solicitar producto', error);
      setMensajeAlerta('Error al enviar la solicitud al administrador.');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const currentProgress = totalRecargas % 6;
  const isNextFree = currentProgress === 5;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden animate-fadeIn">
      
      {/* Cabecera colorida */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 pt-8 pb-6 px-6 rounded-b-3xl shadow-lg z-10 shrink-0">
        <div className="flex justify-between items-center text-white mb-4">
          
          {/* LOGOTIPO DE LA EMPRESA */}
          <div className="bg-white/20 px-3 py-1.5 rounded-2xl backdrop-blur-sm flex items-center shadow-inner">
            <img 
              src="/LOGO.png" 
              alt="Logo Empresa" 
              className="h-10 w-auto object-contain filter drop-shadow" 
            />
          </div>

          <button onClick={cerrarSesion} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-sm">
            <LogOut className="h-5 w-5 text-white" />
          </button>
        </div>
        
        <div>
          <h1 className="text-2xl font-black text-white leading-tight">¡Hola, {usuario.nombre}!</h1>
          <p className="text-blue-100 text-sm mt-1 opacity-90">Tu hidratación está al día 💧</p>
        </div>
      </header>

      {/* Área de contenido desplazable */}
      <main className="flex-1 overflow-y-auto p-5 pb-24 space-y-6">
        
        {/* Notificación flotante si hay mensajes */}
        {notificaciones.length > 0 && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-4 rounded-2xl shadow-md text-white flex items-center gap-3">
            <Bell className="h-6 w-6 shrink-0 animate-bounce" />
            <span className="text-sm font-semibold">{notificaciones[0].mensaje}</span>
          </div>
        )}

        {/* Alerta de éxito al pedir un producto */}
        {mensajeAlerta && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl shadow-sm text-sm font-bold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{mensajeAlerta}</span>
          </div>
        )}

        {/* Tab: Inicio (Tarjeta de progreso principal) */}
        {activeTab === 'inicio' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 bg-blue-50 w-32 h-32 rounded-full opacity-50"></div>
            
            <div className="relative z-10 text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Tu Tarjeta Digital</h3>
              <p className="text-slate-500 text-sm mt-1">Llevas <span className="font-bold text-blue-600">{totalRecargas} recargas</span>. Acumula 5 y la 6ta es <span className="font-bold text-blue-600">GRATIS</span></p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 place-items-center relative z-10">
              {[1, 2, 3, 4, 5, 'GRATIS'].map((item, index) => {
                const isAchieved = index < currentProgress;
                const isFreeSlot = item === 'GRATIS';
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`
                      h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold shadow-sm transition-all
                      ${isAchieved ? 'bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-blue-200 shadow-lg scale-105' : 
                        isFreeSlot ? 'bg-amber-100 border-2 border-amber-400 text-amber-600 border-dashed' : 
                        'bg-slate-50 border-2 border-slate-100 text-slate-300'}
                      ${isNextFree && isFreeSlot ? 'animate-pulse bg-gradient-to-tr from-amber-400 to-orange-400 text-white border-none shadow-orange-200 shadow-xl scale-110' : ''}
                    `}>
                      {isAchieved ? <CheckCircle className="h-6 w-6" /> : 
                       isFreeSlot ? <Gift className="h-6 w-6" /> : 
                       <Droplet className="h-6 w-6 opacity-40" />}
                    </div>
                    <span className="mt-2 text-xs font-bold text-slate-400">
                      {isFreeSlot ? 'Premio' : `${item}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab: Catálogo Real con Opción de Compra/Reserva */}
        {activeTab === 'catalogo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 pl-2">Nuestros Productos</h2>
            
            {productosCatalogo.length > 0 ? (
              productosCatalogo.map((prod) => (
                <div key={prod.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      {prod.imagen_url && prod.imagen_url.startsWith('/uploads') ? (
                        <img src={`https://backend-clearwater.onrender.com/api/${prod.imagen_url}`} alt={prod.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800">{prod.nombre}</h4>
                        <span className="font-black text-blue-600 text-base">${Number(prod.precio).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{prod.descripcion}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => solicitarProducto(prod)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingCart className="h-4 w-4" /> Reservar producto
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <Package className="h-12 w-12 text-blue-200 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">Catálogo vacío</h3>
                <p className="text-sm text-slate-500 mt-2">Pronto el administrador agregará productos disponibles.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Historial Mejorado */}
        {activeTab === 'historial' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-lg font-bold text-slate-800">Tus Recargas y Canjes</h3>
              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">
                Total: {historialRecargas.length}
              </span>
            </div>

            {historialRecargas && historialRecargas.length > 0 ? (
              historialRecargas.map((recarga, index) => (
                <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      recarga.es_promocion ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {recarga.es_promocion ? '🎁' : '💧'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {recarga.es_promocion ? '¡Botellón de Agua Gratis!' : 'Recarga de Botellón 20L'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(recarga.fecha).toLocaleDateString('es-EC', { dateStyle: 'medium' })} - <span className="capitalize">{recarga.metodo_pago}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-sm ${recarga.es_promocion ? 'text-amber-600' : 'text-slate-800'}`}>
                      {recarga.es_promocion ? '$0.00' : `$${Number(recarga.valor).toFixed(2)}`}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">
                      {recarga.es_promocion ? 'Premio' : 'Pagado'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <Clock className="h-12 w-12 text-blue-200 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">Sin historial aún</h3>
                <p className="text-sm text-slate-500 mt-2">Tus recargas aparecerán aquí en cuanto realices tu primera compra.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Barra de Navegación Inferior */}
      <nav className="bg-white border-t border-slate-100 fixed bottom-0 w-full px-6 py-3 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl pb-safe">
        {[
          { id: 'inicio', label: 'Progreso', icon: Home },
          { id: 'catalogo', label: 'Catálogo', icon: Package },
          { id: 'historial', label: 'Historial', icon: Clock }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className={`h-6 w-6 ${isActive ? 'fill-blue-100 stroke-[1.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 1rem); }
      `}} />
    </div>
  );
};

export default ClienteDashboard;