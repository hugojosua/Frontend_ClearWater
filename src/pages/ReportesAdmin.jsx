import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart as BarChartIcon, DollarSign, Droplet, Users, TrendingUp, Calendar, Filter } from 'lucide-react';

const ReportesAdmin = () => {
  const [resumen, setResumen] = useState({ total_clientes: 0 });
  const [historial, setHistorial] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para los filtros de la tabla inferior
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('todos');
  const [filtroCliente, setFiltroCliente] = useState('todos');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Cargar resumen general
      const resResumen = await axios.get('https://backend-clearwater.onrender.com/api/reportes', { headers });
      setResumen(resResumen.data);

      // 2. Cargar historial detallado de todas las recargas
      try {
        const resHistorial = await axios.get('https://backend-clearwater.onrender.com/api/reportes/historial', { headers });
        setHistorial(resHistorial.data);
      } catch (e) {
        console.warn("Falta crear el endpoint de historial en el backend");
      }

      // 3. Cargar lista de clientes para el filtro
      const resClientes = await axios.get('https://backend-clearwater.onrender.com/api/clientes', { headers });
      setClientes(resClientes.data);

    } catch (err) {
      console.error('Error al cargar métricas');
    } finally {
      setCargando(false);
    }
  };

  // --- CÁLCULO AUTOMÁTICO: INGRESOS Y RECARGAS DEL MES ACTUAL ---
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();

  const recargasDelMes = historial.filter(item => {
    const fechaItem = new Date(item.fecha);
    return fechaItem.getMonth() === mesActual && fechaItem.getFullYear() === anioActual;
  });

  const ingresosDelMes = recargasDelMes
    .reduce((sum, item) => sum + Number(item.es_promocion ? 0 : (item.valor || 0)), 0)
    .toFixed(2);
  
  const totalRecargasDelMes = recargasDelMes.length;
  // -------------------------------------------------------------

  // Lógica de filtrado dinámico para la tabla detallada inferior
  const historialFiltrado = historial.filter(item => {
    let cumpleFecha = true;
    let cumpleMetodo = true;
    let cumpleCliente = true;
    const fechaItem = new Date(item.fecha);

    if (fechaInicio) cumpleFecha = cumpleFecha && fechaItem >= new Date(fechaInicio + 'T00:00:00');
    if (fechaFin) cumpleFecha = cumpleFecha && fechaItem <= new Date(fechaFin + 'T23:59:59');
    if (filtroMetodo !== 'todos') cumpleMetodo = item.metodo_pago === filtroMetodo;
    if (filtroCliente !== 'todos') cumpleCliente = item.usuario_id?.toString() === filtroCliente.toString() || item.cliente_nombre === filtroCliente;

    return cumpleFecha && cumpleMetodo && cumpleCliente;
  });

  // Recalcular ingresos basados en el filtro activo de la tabla
  const ingresosFiltrados = historialFiltrado.reduce((sum, item) => sum + Number(item.valor || 0), 0).toFixed(2);
  const recargasFiltradas = historialFiltrado.length;

  if (cargando) return <div className="p-8 text-center text-slate-500 font-bold">Cargando reportes...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <BarChartIcon className="h-6 w-6 text-blue-600" /> Resumen Financiero y de Ventas
      </h2>

      {/* Tarjetas Superiores (Mes Actual y Clientes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta: Ingresos del Mes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-emerald-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Ingresos del Mes</p>
              <h3 className="text-4xl font-black text-slate-800 mt-1">${ingresosDelMes}</h3>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <DollarSign className="h-6 w-6 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-bold mt-3 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Mes en curso
          </p>
        </div>

        {/* Tarjeta: Recargas del Mes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-blue-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Recargas del Mes</p>
              <h3 className="text-4xl font-black text-slate-800 mt-1">{totalRecargasDelMes}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Droplet className="h-6 w-6 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xs text-blue-600 font-bold mt-3">Botellones entregados este mes</p>
        </div>

        {/* Tarjeta: Clientes Activos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-purple-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Clientes Activos</p>
              <h3 className="text-4xl font-black text-slate-800 mt-1">{resumen.total_clientes || 0}</h3>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Users className="h-6 w-6 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xs text-purple-600 font-bold mt-3">En tu base de datos</p>
        </div>

      </div>

      {/* Zona de Filtros */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Filter className="h-5 w-5 text-blue-600"/> Filtrar Movimientos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-slate-700" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-slate-700" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Método de Pago</label>
            <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-slate-700 bg-white">
              <option value="todos">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cliente</label>
            <select value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-slate-700 bg-white">
              <option value="todos">Todos los clientes</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resultados del filtro */}
        <div className="flex gap-4 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex-1">
            <span className="text-sm text-blue-600 font-bold block">Recargas en este periodo:</span>
            <span className="text-2xl font-black text-blue-800">{recargasFiltradas}</span>
          </div>
          <div className="flex-1">
            <span className="text-sm text-blue-600 font-bold block">Dinero generado:</span>
            <span className="text-2xl font-black text-blue-800">${ingresosFiltrados}</span>
          </div>
        </div>

        {/* Tabla Detallada */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-bold">Fecha</th>
                <th className="p-4 font-bold">Cliente</th>
                <th className="p-4 font-bold">Método</th>
                <th className="p-4 font-bold text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {historialFiltrado.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700">
                    {(() => {
                      // Forzamos la lectura correcta de la fecha evitando el desfase de zona horaria
                      const fechaLimpia = new Date(item.fecha.endsWith('Z') || item.fecha.includes('+') ? item.fecha : item.fecha + 'Z');
                      return fechaLimpia.toLocaleString('es-EC', { 
                        timeZone: 'America/Guayaquil', 
                        dateStyle: 'short', 
                        timeStyle: 'medium' 
                      });
                    })()}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{item.cliente_nombre}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                      ${item.es_promocion ? 'bg-amber-100 text-amber-700' : 
                        item.metodo_pago === 'efectivo' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {item.es_promocion ? '🎁 Promoción (Gratis)' : item.metodo_pago}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-800">
                    ${Number(item.valor).toFixed(2)}
                  </td>
                </tr>
              ))}
              {historialFiltrado.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No hay registros para estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportesAdmin;