import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

const CatalogoAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState({ nombre: '', descripcion: '', precio: '' });
  const [archivo, setArchivo] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/productos');
      setProductos(res.data);
    } catch (error) {
      console.error('Error cargando catálogo', error);
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('nombre', formulario.nombre);
      formData.append('descripcion', formulario.descripcion);
      formData.append('precio', formulario.precio);
      if (archivo) {
        formData.append('imagen', archivo); // Adjuntamos el archivo del almacenamiento interno
      }

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' 
      };

      if (editandoId) {
        await axios.put(`http://localhost:5000/api/productos/${editandoId}`, formData, { headers });
        setMensaje('Producto actualizado exitosamente');
      } else {
        await axios.post('http://localhost:5000/api/productos', formData, { headers });
        setMensaje('Nuevo producto agregado al catálogo');
      }
      
      setFormulario({ nombre: '', descripcion: '', precio: '' });
      setArchivo(null);
      setEditandoId(null);
      setMostrarFormulario(false);
      cargarProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al guardar el producto');
    }
  };

  const eliminarProducto = async (id) => {
    if (window.confirm('¿Eliminar este producto del catálogo?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/productos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Producto eliminado');
        cargarProductos();
        setTimeout(() => setMensaje(''), 3000);
      } catch (error) {
        setMensaje('Error al eliminar');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" /> Catálogo de Productos
        </h2>
        <button 
          onClick={() => { setMostrarFormulario(!mostrarFormulario); setEditandoId(null); setFormulario({ nombre: '', descripcion: '', precio: '' }); setArchivo(null); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          {mostrarFormulario ? 'Cancelar' : 'Agregar Producto'}
        </button>
      </div>

      {mensaje && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg font-bold border border-green-200">
          {mensaje}
        </div>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="bg-slate-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editandoId ? '✏️ Editar Producto' : '✨ Nuevo Producto'}</h3>
          <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Producto</label>
              <input type="text" required value={formulario.nombre} onChange={e => setFormulario({...formulario, nombre: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Ej: Botellón 20L" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Precio Referencial ($)</label>
              <input type="number" step="0.01" required value={formulario.precio} onChange={e => setFormulario({...formulario, precio: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="0.00" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Descripción corta</label>
              <textarea required value={formulario.descripcion} onChange={e => setFormulario({...formulario, descripcion: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none" rows="2" placeholder="Detalles del producto..."></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Imagen desde el Dispositivo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setArchivo(e.target.files[0])} 
                className="w-full border border-slate-300 p-2 rounded-lg text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer bg-white" 
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                {editandoId ? 'Actualizar Producto' : 'Guardar Producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map(producto => (
          <div key={producto.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden relative">
              {producto.imagen_url && producto.imagen_url.startsWith('/uploads') ? (
                <img src={`http://localhost:5000${producto.imagen_url}`} alt={producto.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">📦</span>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{producto.nombre}</h3>
                <span className="bg-blue-100 text-blue-700 font-black px-2 py-1 rounded-lg text-sm">${producto.precio}</span>
              </div>
              <p className="text-slate-500 text-sm flex-1">{producto.descripcion}</p>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => { setFormulario(producto); setEditandoId(producto.id); setMostrarFormulario(true); }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => eliminarProducto(producto.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogoAdmin;