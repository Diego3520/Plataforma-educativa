import pool from '../db';
import { material } from '../models/material';

export class materialRepository {
  async findAll(): Promise<material[]> {
    const res = await pool.query('SELECT * FROM material ORDER BY material_id');
    return res.rows;
  }

  async findByCurso(cursoId: number): Promise<material[]> {
    const res = await pool.query('SELECT * FROM material WHERE id_curso = $1 ORDER BY material_id', [cursoId]);
    return res.rows;
  }

  async findById(id: number): Promise<material | null> {
    const res = await pool.query('SELECT * FROM material WHERE material_id = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByContentType(contentType: string): Promise<material[]> {
    const res = await pool.query('SELECT * FROM material WHERE content_type = $1 ORDER BY material_id', [contentType]);
    return res.rows;
  }

  async create(data: Omit<material, 'material_id' | 'creado_at'>): Promise<material> {
    const query = `INSERT INTO material (solucion_modelo, ruta_archivo, tamano_bytes, mime_type, content_type, activo, id_curso)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const values = [
      data.solucion_modelo,
      data.ruta_archivo,
      data.tamano_bytes,
      data.mime_type,
      data.content_type,
      data.activo,
      data.id_curso
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<material, 'material_id' | 'creado_at'>>): Promise<material | null> {
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
    const query = `UPDATE material SET ${sets.join(', ')} WHERE material_id = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM material WHERE material_id = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
