import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://straydogs-290096756800.southamerica-east1.run.app/api';

export const inscritoApi = {
  async porUsuario(usuarioId: number): Promise<any[]> {
    const { data } = await axios.get<any[]>(`${API_URL}/inscritos/usuario/${usuarioId}`);
    return data;
  },
};


