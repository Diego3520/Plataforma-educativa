import pool from '../db';
import { editor } from '../models/editor';

export class editorRepository {
  async findAll(): Promise<editor[]> {
    const res = await pool.query('SELECT * FROM editores ORDER BY editor_id');
    return res.rows;
  }

  async findById(id: number): Promise<editor | null> {
    const res = await pool.query('SELECT * FROM editores WHERE editor_id = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByDocenteId(docenteId: number): Promise<editor | null> {
    const res = await pool.query('SELECT * FROM editores WHERE id_docente = $1', [docenteId]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async create(data: Omit<editor, 'editor_id' | 'creado_at'>): Promise<editor> {
    const query = `INSERT INTO editores (id_docente, activo)
      VALUES ($1, $2) RETURNING *`;
    const values = [data.id_docente, data.activo];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<editor, 'editor_id' | 'creado_at'>>): Promise<editor | null> {
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
    const query = `UPDATE editores SET ${sets.join(', ')} WHERE editor_id = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM editores WHERE editor_id = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
