import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://plataforma-educativa-production-12c8.up.railway.app/api';
const BASE_URL = import.meta.env.VITE_API_URL || 'https://plataforma-educativa-production-12c8.up.railway.app';

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

  async login(datos: {
    correo: string;
    password: string;
  }) {
    const response = await axios.post(`${API_URL}/auth/login`, datos);
    return response.data;
  },

  getGoogleAuthUrl() {
    return `${BASE_URL}/auth/google`;
  },

  getMicrosoftAuthUrl() {
    return `${BASE_URL}/auth/microsoft`;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): any | null {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        return JSON.parse(usuarioStr);
      } catch (e) {
        console.error('Error parsing usuario:', e);
        return null;
      }
    }
    return null;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
};