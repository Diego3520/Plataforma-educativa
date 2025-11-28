import pool from '../db';
import { curso } from '../models/curso';

export class cursoRepository {
  async findAll(): Promise<curso[]> {
    const res = await pool.query('SELECT * FROM cursos ORDER BY fecha_creacion ASC');
    return res.rows;
  }

  async findById(id: number): Promise<curso | null> {
    const res = await pool.query('SELECT * FROM cursos WHERE id_curso = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByDocenteId(docenteId: number): Promise<curso[]> {
    const res = await pool.query('SELECT * FROM cursos WHERE docente_id = $1 ORDER BY id_curso', [docenteId]);
    return res.rows;
  }

  async findByEditorId(editorId: number): Promise<curso[]> {
    const res = await pool.query('SELECT * FROM cursos WHERE editor_id = $1 ORDER BY id_curso', [editorId]);
    return res.rows;
  }

  async findByEvaluadorId(evaluadorId: number): Promise<curso[]> {
    const res = await pool.query('SELECT * FROM cursos WHERE evaluador_id = $1 ORDER BY id_curso', [evaluadorId]);
    return res.rows;
  }

  async findByActivo(activo: boolean): Promise<curso[]> {
    const res = await pool.query('SELECT * FROM cursos WHERE activo = $1', [activo]);
    return res.rows;
  }

  async setAllInactive(excludeId?: number): Promise<void> {
    if (excludeId) {
      await pool.query('UPDATE cursos SET activo = false WHERE id_curso != $1', [excludeId]);
    } else {
      await pool.query('UPDATE cursos SET activo = false');
    }
  }

  async create(data: Omit<curso, 'id_curso' | 'fecha_creacion'>): Promise<curso> {
    const query = `INSERT INTO cursos (codigo, editor_id, docente_id, evaluador_id, titulo, descripcion, activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const values = [
      data.codigo,
      data.editor_id,
      data.docente_id,
      data.evaluador_id,
      data.titulo,
      data.descripcion,
      data.activo ?? true
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<curso, 'id_curso' | 'fecha_creacion'>>): Promise<curso | null> {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return this.findById(id);
    }

    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const key of keys) {
      sets.push(`${key} = $${idx}`);
      values.push((data as any)[key]);
      idx = idx + 1;
    }
    values.push(id);
    const query = `UPDATE cursos SET ${sets.join(', ')} WHERE id_curso = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM cursos WHERE id_curso = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
