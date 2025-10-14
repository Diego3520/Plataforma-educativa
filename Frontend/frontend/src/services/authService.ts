import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  async registroManual(datos: {
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    tipo: string;
  }) {
    const response = await axios.post(`${API_URL}/auth/registro`, datos);
    return response.data;
  },

  async verificarCodigo(codigo: string) {
    const response = await axios.post(`${API_URL}/auth/verificar`, { codigo });
    return response.data;
  },

  async reenviarCodigo(correo: string) {
    const response = await axios.post(`${API_URL}/auth/reenviar`, { correo });
    return response.data;
  },

  getGoogleAuthUrl() {
    return `${API_URL}/auth/google`;
  },

  getMicrosoftAuthUrl() {
    return `${API_URL}/auth/microsoft`;
  }
};