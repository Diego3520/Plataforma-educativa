import pool from '../db';
import { comentarioEditor } from '../models/comentarioEditor';

export class comentarioEditorRepository {
  async findAll(): Promise<comentarioEditor[]> {
    const res = await pool.query('SELECT * FROM comentarios_editor ORDER BY creado_at DESC');
    return res.rows;
  }

  async findById(id: number): Promise<comentarioEditor | null> {
    const res = await pool.query('SELECT * FROM comentarios_editor WHERE id_comentario = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByTopicoId(topicoId: number): Promise<comentarioEditor[]> {
    const res = await pool.query(
      'SELECT * FROM comentarios_editor WHERE id_topico = $1 AND activo = true ORDER BY creado_at DESC',
      [topicoId]
    );
    return res.rows;
  }

  async findByEditorId(editorId: number): Promise<comentarioEditor[]> {
    const res = await pool.query(
      'SELECT * FROM comentarios_editor WHERE id_editor = $1 ORDER BY creado_at DESC',
      [editorId]
    );
    return res.rows;
  }

  async create(data: Omit<comentarioEditor, 'id_comentario' | 'creado_at' | 'actualizado_at'>): Promise<comentarioEditor> {
    const query = `INSERT INTO comentarios_editor (id_topico, id_editor, contenido, tipo, material_id, activo)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      data.id_topico,
      data.id_editor,
      data.contenido,
      data.tipo,
      data.material_id,
      data.activo ?? true
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<comentarioEditor, 'id_comentario' | 'creado_at'>>): Promise<comentarioEditor | null> {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return this.findById(id);
    }

    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const key of keys) {
      if (key !== 'actualizado_at') {
        sets.push(`${key} = $${idx}`);
        values.push((data as any)[key]);
        idx = idx + 1;
      }
    }
    // Agregar actualizado_at automáticamente
    sets.push('actualizado_at = NOW()');
    values.push(id);
    const query = `UPDATE comentarios_editor SET ${sets.join(', ')} WHERE id_comentario = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM comentarios_editor WHERE id_comentario = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}

