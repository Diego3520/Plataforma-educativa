import React, { useState } from 'react';
import Modal from 'react-modal';
import { authService } from '../services/authService';

// Asegurar que Modal esté accesible para lectores de pantalla
Modal.setAppElement('#root');

const Registro: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [registroManualModalIsOpen, setRegistroManualModalIsOpen] = useState(false);
  const [verificacionModalIsOpen, setVerificacionModalIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    tipo: 'alumno'
  });
  const [codigo, setCodigo] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRegistroManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const response = await authService.registroManual(formData);
      setEmail(formData.correo);
      setMensaje(response.mensaje);
      setRegistroManualModalIsOpen(false);
      setVerificacionModalIsOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar usuario');
    }
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const response = await authService.verificarCodigo(codigo);
      setMensaje(response.mensaje);
      // Guardar token en localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
      }
      setTimeout(() => {
        setVerificacionModalIsOpen(false);
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al verificar código');
    }
  };

  const handleReenviarCodigo = async () => {
    try {
      setError('');
      const response = await authService.reenviarCodigo(email);
      setMensaje(response.mensaje);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al reenviar código');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  const handleMicrosoftLogin = () => {
    window.location.href = authService.getMicrosoftAuthUrl();
  };

  return (
    <div>
      <button onClick={() => setModalIsOpen(true)}>Registrarse</button>

      {/* Modal principal de opciones de registro */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Opciones de Registro"
      >
        <h2>Selecciona una opción de registro</h2>
        <div>
          <button onClick={handleGoogleLogin}>Registrarse con Google</button>
          <button onClick={handleMicrosoftLogin}>Registrarse con Microsoft</button>
          <button onClick={() => {
            setModalIsOpen(false);
            setRegistroManualModalIsOpen(true);
          }}>Registro Manual</button>
        </div>
        <button onClick={() => setModalIsOpen(false)}>Cerrar</button>
      </Modal>

      {/* Modal de registro manual */}
      <Modal
        isOpen={registroManualModalIsOpen}
        onRequestClose={() => setRegistroManualModalIsOpen(false)}
        contentLabel="Registro Manual"
      >
        <h2>Registro Manual</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <form onSubmit={handleRegistroManual}>
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Apellido:</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Correo:</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
            />
          </div>
          <div>
            <label>Tipo de usuario:</label>
            <select name="tipo" value={formData.tipo} onChange={handleInputChange}>
              <option value="alumno">Alumno</option>
            </select>
          </div>
          <button type="submit">Registrarse</button>
          <button type="button" onClick={() => setRegistroManualModalIsOpen(false)}>Cancelar</button>
        </form>
      </Modal>

      {/* Modal de verificación */}
      <Modal
        isOpen={verificacionModalIsOpen}
        onRequestClose={() => setVerificacionModalIsOpen(false)}
        contentLabel="Verificación de Correo"
      >
        <h2>Verificación de Correo</h2>
        {mensaje && <div style={{ color: 'green' }}>{mensaje}</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <p>Hemos enviado un código de verificación a tu correo: {email}</p>
        <form onSubmit={handleVerificarCodigo}>
          <div>
            <label>Código de verificación:</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </div>
          <button type="submit">Verificar</button>
          <button type="button" onClick={handleReenviarCodigo}>Reenviar Código</button>
          <button type="button" onClick={() => setVerificacionModalIsOpen(false)}>Cancelar</button>
        </form>
      </Modal>
    </div>
  );
};

export default Registro;