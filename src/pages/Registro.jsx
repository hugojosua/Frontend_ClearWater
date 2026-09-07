import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    direccion: '',
    password: ''
  });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación exclusiva para cédula y teléfono: Solo permite números y máximo 10 dígitos
    if (name === 'cedula' || name === 'telefono') {
      const soloNumeros = value.replace(/[^0-9]/g, ''); // Elimina letras o caracteres especiales
      if (soloNumeros.length > 10) return; // Bloquea si intenta escribir más de 10
      setFormData({ ...formData, [name]: soloNumeros });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificación final de longitud antes de enviar a Render
    if (formData.cedula.length !== 10) {
      setMensaje({ tipo: 'error', texto: 'La cédula debe tener exactamente 10 números.' });
      return;
    }
    if (formData.telefono.length !== 10) {
      setMensaje({ tipo: 'error', texto: 'El teléfono debe tener exactamente 10 números.' });
      return;
    }

    try {
      // Usamos el rol "cliente" por defecto para el uso real del sistema
      const response = await axios.post('https://backend-clearwater.onrender.com/api/auth/registro', {
        ...formData,
        rol: 'cliente' // Cambiar a 'cliente' para producción
      });

      setMensaje({ tipo: 'exito', texto: '¡Usuario registrado correctamente!' });
      
      // Esperamos 2 segundos y lo enviamos al login
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      // El backend avisará aquí si la cédula ya se repite en la base de datos
      setMensaje({ 
        tipo: 'error', 
        texto: err.response?.data?.error || 'Error al conectar con el servidor' 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Crea tu Cuenta</h1>
          <p className="text-gray-500 text-sm">Únete al Sistema de Agua</p>
        </div>

        {mensaje.texto && (
          <div className={`p-3 rounded-lg mb-4 text-center text-sm font-bold ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Nombre Completo</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Juan Pérez" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Cédula (10 dígitos)</label>
            <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: 1712345678" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0999999999" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Contraseña</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="********" />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Dirección</label>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Calle Principal y Secundaria" />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-2 transition-colors">
            Registrarme
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta? <Link to="/" className="text-blue-600 font-bold hover:underline">Inicia Sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;