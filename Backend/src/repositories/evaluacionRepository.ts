import pool from '../db';
import { evaluacion } from '../models/evaluacion';

export class evaluacionRepository {
  async findAll(): Promise<evaluacion[]> {
    const res = await pool.query('SELECT * FROM evaluacion ORDER BY id_evaluacion');
    return res.rows;
  }

  async findById(id: number): Promise<evaluacion | null> {
    const res = await pool.query('SELECT * FROM evaluacion WHERE id_evaluacion = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByTopicoId(topicoId: number): Promise<evaluacion[]> {
    const res = await pool.query('SELECT * FROM evaluacion WHERE id_topico = $1 ORDER BY fecha_publicacion', [topicoId]);
    return res.rows;
  }

  async create(data: Omit<evaluacion, 'id_evaluacion' | 'creado_at'>): Promise<evaluacion> {
    const query = `INSERT INTO evaluacion (id_topico, fecha_publicacion, fecha_limite, material_id, nota_max, respuesta_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      data.id_topico,
      data.fecha_publicacion,
      data.fecha_limite,
      data.material_id,
      data.nota_max,
      data.respuesta_id
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<evaluacion, 'id_evaluacion' | 'creado_at'>>): Promise<evaluacion | null> {
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
    const query = `UPDATE evaluacion SET ${sets.join(', ')} WHERE id_evaluacion = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM evaluacion WHERE id_evaluacion = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
