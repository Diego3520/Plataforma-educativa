import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const inscritoApi = {
  async porUsuario(usuarioId: number): Promise<any[]> {
    const { data } = await axios.get<any[]>(`${API_URL}/inscrito/usuario/${usuarioId}`);
    return data;
  },
};


