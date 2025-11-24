import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://plataforma-educativa-production-12c8.up.railway.app/api';

export const inscritoApi = {
  async porUsuario(usuarioId: number): Promise<any[]> {
    const { data } = await axios.get<any[]>(`${API_URL}/inscritos/usuario/${usuarioId}`);
    return data;
  },
};


