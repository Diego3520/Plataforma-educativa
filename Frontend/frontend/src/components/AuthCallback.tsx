import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import { authService } from '../services/authService';

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
      setModalIsOpen(true);
    }
  }, [location]);

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
        setModalIsOpen(false);
        window.location.href = '/';
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

  return (
    <div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
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
          <button type="button" onClick={() => window.location.href = '/'}>Cancelar</button>
        </form>
      </Modal>
    </div>
  );
};

export default AuthCallback;