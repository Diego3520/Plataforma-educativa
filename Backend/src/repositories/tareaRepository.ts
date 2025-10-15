import pool from '../db';
import { tarea } from '../models/tarea';

export class tareaRepository {
  async findAll(): Promise<tarea[]> {
    const res = await pool.query('SELECT * FROM tarea ORDER BY id_tarea');
    return res.rows;
  }

  async findById(id: number): Promise<tarea | null> {
    const res = await pool.query('SELECT * FROM tarea WHERE id_tarea = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByTopicoId(topicoId: number): Promise<tarea[]> {
    const res = await pool.query('SELECT * FROM tarea WHERE id_topico = $1 ORDER BY fecha_publicacion', [topicoId]);
    return res.rows;
  }

  async create(data: Omit<tarea, 'id_tarea' | 'creado_at'>): Promise<tarea> {
    const query = `INSERT INTO tarea (id_topico, fecha_publicacion, fecha_limite, material_id, nota_max, solucion_aportada)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      data.id_topico,
      data.fecha_publicacion,
      data.fecha_limite,
      data.material_id,
      data.nota_max,
      data.solucion_aportada
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<tarea, 'id_tarea' | 'creado_at'>>): Promise<tarea | null> {
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
    const query = `UPDATE tarea SET ${sets.join(', ')} WHERE id_tarea = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM tarea WHERE id_tarea = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
