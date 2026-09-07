import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Send, CheckCircle, Sparkles, Calendar, ShoppingCart, PackageOpen, User } from 'lucide-react';

const AdminNotificaciones = () => {
  const [clientes, setClientes] = useState([]);
  const [destinatario, setDestinatario] = useState('todos');
  const [mensaje, setMensaje] = useState('');
  const [historial, setHistorial] = useState([]);
  const [estado, setEstado] = useState({ texto: '', tipo: '' });
  const [vistaActiva, setVistaActiva] = useState('pedidos'); // 'pedidos' o 'enviar'

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const resClientes = await axios.get('https://backend-clearwater.onrender.com/api/clientes', { headers });
      setClientes(resClientes.data);

      const resHistorial = await axios.get('https://backend-clearwater.onrender.com/api/notificaciones', { headers });
      setHistorial(resHistorial.data);
    } catch (error) {
      console.error('Error al cargar datos', error);
    }
  };

  const enviarNotificacion = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post('https://backend-clearwater.onrender.com/api/notificaciones', {
        usuario_id: destinatario === 'todos' ? null : destinatario,
        mensaje
      }, { headers });

      setEstado({ texto: '¡Alerta enviada exitosamente!', tipo: 'exito' });
      setMensaje('');
      cargarDatos();
      setTimeout(() => setEstado({ texto: '', tipo: '' }), 4000);
    } catch (error) {
      setEstado({ texto: 'Error al enviar la notificación', tipo: 'error' });
    }
  };

  const plantillas = [
    { titulo: '🎁 ¡Estás cerca!', texto: '¡Hola! Te faltan pocas recargas para llevarte tu botellón completamente GRATIS. ¡Te esperamos!' },
    { titulo: '💧 Agua Pura', texto: 'Aprovecha hoy nuestro servicio express de agua purificada con triple filtro y ozono. ¡Pide tu botellón!' },
    { titulo: '⚡ Promoción', texto: '¡Gran promoción de la semana! Ven por tu recarga y acumula el doble de puntos en tu tarjeta digital.' }
  ];

  // Separar claramente los pedidos de clientes y las alertas generales
  const pedidosClientes = historial.filter(item => item.mensaje && item.mensaje.startsWith('PEDIDO_PRODUCTO:'));
  const alertasEnviadas = historial.filter(item => !item.mensaje || !item.mensaje.startsWith('PEDIDO_PRODUCTO:'));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera Principal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" /> Centro de Comunicaciones y Pedidos
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona las solicitudes de compra de los clientes y envía alertas masivas.</p>
        </div>

        {/* Pestañas de Navegación Clara */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
          <button 
            onClick={() => setVistaActiva('pedidos')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              vistaActiva === 'pedidos' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Pedidos de Clientes 
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${vistaActiva === 'pedidos' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {pedidosClientes.length}
            </span>
          </button>
          <button 
            onClick={() => setVistaActiva('enviar')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              vistaActiva === 'enviar' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="h-4 w-4" /> Enviar Alertas / Mensajes
          </button>
        </div>
      </div>

      {estado.texto && (
        <div className={`p-4 rounded-xl font-bold flex items-center gap-2 ${estado.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          <CheckCircle className="h-5 w-5" /> {estado.texto}
        </div>
      )}

      {/* VISTA 1: PEDIDOS DE CLIENTES (Diseño limpio en tarjetas con nombre de producto claro) */}
      {vistaActiva === 'pedidos' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800">
            <PackageOpen className="h-6 w-6 text-amber-600 shrink-0" />
            <div className="text-sm">
              <span className="font-bold block">Bandeja de Pedidos Web</span>
              <span>Aquí aparecen los productos específicos que los clientes han seleccionado y querido reservar desde la app.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pedidosClientes.map(item => {
              // Extraer el nombre del producto limpiando el texto del mensaje
              const detalleProducto = item.mensaje.replace('PEDIDO_PRODUCTO: ', '');
              
              return (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Nuevo Pedido
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 text-xl font-black">
                      🛒
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                        <User className="h-3.5 w-3.5" /> Cliente: <span className="text-slate-800 font-bold">{item.usuario_nombre || 'Cliente App'}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-800 mt-1">
                        {detalleProducto}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
                    <span>📅 {new Date(item.fecha).toLocaleString()}</span>
                    <span className="text-blue-600 font-bold">Atender pedido por llamada/WhatsApp</span>
                  </div>
                </div>
              );
            })}

            {pedidosClientes.length === 0 && (
              <div className="col-span-full text-center bg-white p-12 rounded-2xl border border-slate-200 shadow-sm">
                <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-base">No hay pedidos pendientes</h3>
                <p className="text-sm text-slate-400 mt-1">Cuando un cliente solicite un producto del catálogo aparecerá aquí ordenado.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: ENVIAR ALERTAS Y HISTORIAL DE MENSAJES GENERALES */}
      {vistaActiva === 'enviar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulario de Envío */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" /> Redactar Alerta Push
            </h3>

            <form onSubmit={enviarNotificacion} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Destinatario</label>
                <select 
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 outline-none text-slate-700 font-medium"
                >
                  <option value="todos">📢 Todos los clientes (Push General)</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>👤 {c.nombre} ({c.cedula || 'Sin cédula'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mensaje para el cliente</label>
                <textarea 
                  rows="4"
                  placeholder="Escribe tu mensaje aquí..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 outline-none text-slate-700 resize-none font-medium"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="h-5 w-5" /> Enviar Notificación Push
              </button>
            </form>
          </div>

          {/* Plantillas Rápidas */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" /> Plantillas Rápidas
              </h3>
              <p className="text-xs text-blue-700 mb-4">Haz clic en cualquier plantilla para usarla automáticamente:</p>
              
              <div className="space-y-3">
                {plantillas.map((p, index) => (
                  <div 
                    key={index} 
                    onClick={() => setMensaje(p.texto)}
                    className="bg-white p-3.5 rounded-xl border border-blue-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all text-xs"
                  >
                    <span className="font-bold text-blue-800 block mb-1">{p.titulo}</span>
                    <p className="text-slate-600 line-clamp-2">{p.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Historial de Alertas Enviadas */}
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-4">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" /> Historial de Alertas Generales Enviadas
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 text-xs border-b border-slate-200 bg-slate-50/50">
                    <th className="p-4 font-bold">Fecha</th>
                    <th className="p-4 font-bold">Destinatario</th>
                    <th className="p-4 font-bold">Mensaje Enviado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {alertasEnviadas.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(item.fecha).toLocaleString()}</td>
                      <td className="p-4 font-medium text-slate-800 whitespace-nowrap">
                        {item.usuario_nombre ? `👤 ${item.usuario_nombre}` : '📢 General (Todos)'}
                      </td>
                      <td className="p-4 text-slate-600">{item.mensaje}</td>
                    </tr>
                  ))}
                  {alertasEnviadas.length === 0 && (
                    <tr><td colSpan="3" className="p-8 text-center text-slate-400">No hay alertas enviadas recientemente.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminNotificaciones;