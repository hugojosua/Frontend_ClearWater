import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, CheckCircle, Zap, Banknote, Smartphone, Gift, DollarSign, AlertCircle } from 'lucide-react';

const RecargasAdmin = () => {
  const [clientes, setClientes] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [valor, setValor] = useState('2.00');
  const [estadoCliente, setEstadoCliente] = useState(null); // <--- Nuevo estado para el progreso del cliente
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  // Cada vez que cambia el usuario seleccionado, consultamos su estado de recargas
  useEffect(() => {
    if (!usuarioId) {
      setEstadoCliente(null);
      return;
    }
    const consultarEstado = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/recargas/estado-cliente/${usuarioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEstadoCliente(res.data);
        // Si es gratis, ponemos el valor en 0 automáticamente
        if (res.data.esGratisProxima) {
          setValor('0.00');
        } else {
          setValor('2.00');
        }
      } catch (error) {
        console.error('Error al consultar estado del cliente');
      }
    };
    consultarEstado();
  }, [usuarioId]);

  const cargarClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Error al cargar clientes');
    }
  };

  const registrarRecarga = async (e) => {
    e.preventDefault();
    if (!usuarioId) {
      setMensaje({ texto: 'Por favor, selecciona un cliente primero.', tipo: 'error' });
      return;
    }
    
    if (!valor || isNaN(valor) || Number(valor) < 0) {
      setMensaje({ texto: 'Por favor, ingresa un valor válido.', tipo: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/recargas/registrar', 
        { usuario_id: usuarioId, metodo_pago: metodoPago, valor: Number(valor) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const esPromocion = response.data.mensaje.includes('gratis');
      setMensaje({ 
        texto: `${response.data.mensaje} (Faltan ${response.data.faltan_para_gratis} para la próxima gratis)`, 
        tipo: esPromocion ? 'promocion' : 'exito' 
      });
      
      // Limpiamos y recargamos estado del cliente
      setUsuarioId('');
      setBusqueda('');
      setEstadoCliente(null);
      setValor('2.00');
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
    } catch (error) {
      setMensaje({ texto: 'Error al registrar la recarga', tipo: 'error' });
    }
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (c.cedula && c.cedula.includes(busqueda))
  );

  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Zap className="h-6 w-6 text-blue-600" /> Registrar Nueva Recarga
      </h2>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 font-bold ${
          mensaje.tipo === 'promocion' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
          mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
        }`}>
          {mensaje.tipo === 'promocion' ? <Gift className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={registrarRecarga} className="max-w-2xl space-y-6">
        
        {/* 1. Seleccionar Cliente */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            1. Buscar y Seleccionar Cliente
          </label>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
            />
          </div>
          <select 
            size="4"
            value={usuarioId} 
            onChange={(e) => setUsuarioId(e.target.value)}
            className="w-full border border-slate-300 p-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer overflow-y-auto text-slate-700"
            required
          >
            {clientesFiltrados.map(c => (
              <option key={c.id} value={c.id} className="p-2.5 border-b border-slate-100 hover:bg-blue-50">
                {c.nombre} - {c.cedula || 'Sin cédula'}
              </option>
            ))}
            {clientesFiltrados.length === 0 && (
              <option disabled className="text-slate-400 p-2">No se encontraron clientes...</option>
            )}
          </select>

          {/* ALERTA VISUAL DE PROGRESO DEL CLIENTE SELECCIONADO */}
          {estadoCliente && (
            <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 transition-all ${
              estadoCliente.esGratisProxima 
                ? 'bg-amber-50 border-amber-300 text-amber-800' 
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              {estadoCliente.esGratisProxima ? (
                <>
                  <Gift className="h-6 w-6 text-amber-600 shrink-0 animate-bounce" />
                  <div>
                    <span className="font-bold block">¡Este cliente tiene la RECARGA GRATIS!</span>
                    <span className="text-xs opacity-90">Ha completado sus 5 recargas anteriores. Esta 6ta recarga no genera cobro ($0.00).</span>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Progreso actual: {estadoCliente.recargasAcumuladas} / 5 recargas</span>
                    <span className="text-xs opacity-90">Le faltan {estadoCliente.faltantes} recargas más para ganar la próxima gratis.</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 2. Valor y Método de Pago (Agrupados) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Ingreso del Valor */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              2. Valor a Cobrar ($)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                disabled={estadoCliente?.esGratisProxima} // Se bloquea en 0 si es gratis por seguridad
                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700 font-bold text-lg ${
                  estadoCliente?.esGratisProxima ? 'bg-slate-100 text-amber-700 cursor-not-allowed' : ''
                }`}
                required
              />
            </div>
            {estadoCliente?.esGratisProxima && (
              <span className="text-[11px] text-amber-600 font-bold mt-1 block">Bloqueado en $0.00 por promoción de fidelidad.</span>
            )}
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              3. Método de Pago
            </label>
            <div className="flex gap-2">
              <label className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer p-3 rounded-xl border-2 transition-all ${metodoPago === 'efectivo' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                <input type="radio" name="pago" value="efectivo" checked={metodoPago === 'efectivo'} onChange={(e) => setMetodoPago(e.target.value)} className="hidden" />
                <Banknote className={`h-5 w-5 ${metodoPago === 'efectivo' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${metodoPago === 'efectivo' ? 'text-blue-700' : 'text-slate-600'}`}>Efectivo</span>
              </label>
              <label className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer p-3 rounded-xl border-2 transition-all ${metodoPago === 'transferencia' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                <input type="radio" name="pago" value="transferencia" checked={metodoPago === 'transferencia'} onChange={(e) => setMetodoPago(e.target.value)} className="hidden" />
                <Smartphone className={`h-5 w-5 ${metodoPago === 'transferencia' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-bold ${metodoPago === 'transferencia' ? 'text-blue-700' : 'text-slate-600'}`}>Transf.</span>
              </label>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors text-lg flex justify-center items-center gap-2 mt-4 shadow-sm">
          <Zap className="h-5 w-5" />
          {estadoCliente?.esGratisProxima ? 'Confirmar Recarga GRATIS (0.00)' : `Confirmar Recarga por $${Number(valor).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

export default RecargasAdmin;