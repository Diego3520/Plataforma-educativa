export interface comentarioEditor {
  id_comentario: number;
  id_topico: number;
  id_editor: number;
  contenido: string;
  tipo: 'comentario' | 'contenido' | 'material';
  material_id: number | null;
  activo: boolean;
  creado_at: string;
  actualizado_at: string | null;
}

