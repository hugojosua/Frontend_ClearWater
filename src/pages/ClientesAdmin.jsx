import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Hash, Smartphone, MapPin, Droplet, Gift, CheckCircle } from 'lucide-react';

const ClientesAdmin = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [formulario, setFormulario] = useState({ nombre: '', cedula: '', telefono: '', direccion: '', usa_app: false });
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

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

  const guardarCliente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editandoId) {
        await axios.put(`http://localhost:5000/api/clientes/${editandoId}`, formulario, { headers: { Authorization: `Bearer ${token}` } });
        setMensaje('Cliente actualizado exitosamente');
      } else {
        await axios.post('http://localhost:5000/api/clientes', formulario, { headers: { Authorization: `Bearer ${token}` } });
        setMensaje('Cliente registrado exitosamente');
      }
      limpiarFormulario();
      cargarClientes();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al guardar el cliente');
    }
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/clientes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMensaje('Cliente eliminado correctamente');
      cargarClientes();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al eliminar');
    }
  };

  const iniciarEdicion = (cliente) => {
    setFormulario(cliente);
    setEditandoId(cliente.id);
    setMostrarFormulario(true);
  };

  const limpiarFormulario = () => {
    setFormulario({ nombre: '', cedula: '', telefono: '', direccion: '', usa_app: false });
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.cedula.includes(busqueda)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Barra de herramientas superior */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-700"
          />
        </div>
        <button 
          onClick={() => { limpiarFormulario(); setMostrarFormulario(!mostrarFormulario); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          {mostrarFormulario ? 'Cancelar' : 'Nuevo Cliente'}
        </button>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-lg font-bold ${mensaje.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {mensaje}
        </div>
      )}

      {/* Formulario Desplegable */}
      {mostrarFormulario && (
        <div className="bg-slate-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editandoId ? '✏️ Editar Cliente' : '✨ Registrar Cliente'}</h3>
          <form onSubmit={guardarCliente} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
              <input type="text" required value={formulario.nombre} onChange={e => setFormulario({...formulario, nombre: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Cédula</label>
              <input type="text" required value={formulario.cedula} disabled={editandoId !== null} onChange={e => setFormulario({...formulario, cedula: e.target.value})} className={`w-full border border-slate-300 p-2.5 rounded-lg outline-none ${editandoId ? 'bg-slate-200 text-slate-500' : 'focus:ring-2 focus:ring-blue-600'}`} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono</label>
              <input type="text" value={formulario.telefono || ''} onChange={e => setFormulario({...formulario, telefono: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Dirección</label>
              <input type="text" value={formulario.direccion || ''} onChange={e => setFormulario({...formulario, direccion: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                {editandoId ? 'Actualizar' : 'Guardar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-bold">Cliente</th>
                <th className="p-4 font-bold">Contacto</th>
                <th className="p-4 font-bold">Tarjeta de Fidelidad (Progreso)</th>
                <th className="p-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientesFiltrados.map(cliente => {
                const recargas = Number(cliente.recargas_actuales || 0);
                const progreso = recargas % 6;
                const esGratis = progreso === 5;

                return (
                  <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{cliente.nombre}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Hash className="h-3 w-3"/> {cliente.cedula}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-700 flex items-center gap-1"><Smartphone className="h-4 w-4 text-slate-400"/> {cliente.telefono || 'N/A'}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin className="h-4 w-4 text-slate-400"/> {cliente.direccion || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Mini burbujas de progreso */}
                        {[1, 2, 3, 4, 5, '6'].map((item, idx) => {
                          const alcanzado = idx < progreso;
                          const esPremio = item === '6';
                          
                          return (
                            <div 
                              key={idx}
                              title={esPremio ? 'Recarga Gratis (Premio)' : `Recarga ${item}`}
                              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                alcanzado ? 'bg-blue-600 text-white shadow-sm' :
                                esPremio && esGratis ? 'bg-amber-400 text-white animate-bounce shadow-md scale-110 border-2 border-amber-500' :
                                esPremio ? 'bg-amber-100 text-amber-600 border border-amber-300 border-dashed' :
                                'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {alcanzado ? <CheckCircle className="h-3.5 w-3.5" /> : esPremio ? <Gift className="h-3.5 w-3.5" /> : item}
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 mt-1.5 block">
                        {esGratis ? (
                          <span className="text-amber-600 font-bold flex items-center gap-1">🎁 ¡Le toca la recarga gratis!</span>
                        ) : (
                          `Progreso: ${progreso} / 5 recargas`
                        )}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2 items-center">
                      <button onClick={() => iniciarEdicion(cliente)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => eliminarCliente(cliente.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {clientesFiltrados.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No se encontraron clientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientesAdmin;