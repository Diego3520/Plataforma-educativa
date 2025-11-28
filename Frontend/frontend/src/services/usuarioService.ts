import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://straydogs-290096756800.southamerica-east1.run.app/api';

export type Usuario = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  tipo: 'docente' | 'alumno' | 'evaluador' | 'editor' | 'admin';
  correo?: string | null;
};

export const usuarioApi = {
  async listar(): Promise<Usuario[]> {
    const { data } = await axios.get<Usuario[]>(`${API_URL}/usuarios`);
    return data;
  },
  async actualizarTipo(id: number, tipo: Usuario['tipo']): Promise<Usuario> {
    const { data } = await axios.put<Usuario>(`${API_URL}/usuarios/${id}`, { tipo });
    return data;
  },
};


