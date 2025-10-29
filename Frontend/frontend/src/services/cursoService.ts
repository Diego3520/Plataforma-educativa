import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type Curso = {
  id_curso: number;
  codigo: string;
  titulo: string | null;
  descripcion: string | null;
};

export const cursoApi = {
  async porDocente(docenteId: number): Promise<Curso[]> {
    const { data } = await axios.get<Curso[]>(`${API_URL}/curso/docente/${docenteId}`);
    return data;
  },
};


