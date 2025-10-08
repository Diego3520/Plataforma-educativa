import pool from '../db';
import { respuesta } from '../models/respuesta';

export class respuestaRepository {
  async findAll(): Promise<respuesta[]> {
    const res = await pool.query('SELECT * FROM respuesta ORDER BY id_respuesta');
    return res.rows;
  }

  async findById(id: number): Promise<respuesta | null> {
    const res = await pool.query('SELECT * FROM respuesta WHERE id_respuesta = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByNumPregunta(numPregunta: number): Promise<respuesta[]> {
    const res = await pool.query('SELECT * FROM respuesta WHERE num_pregunta = $1 ORDER BY id_respuesta', [numPregunta]);
    return res.rows;
  }

  async create(data: Omit<respuesta, 'id_respuesta' | 'creado_at'>): Promise<respuesta> {
    const query = `INSERT INTO respuesta (num_pregunta, pregunta_descripcion, respuesta_dada)
      VALUES ($1, $2, $3) RETURNING *`;
    const values = [
      data.num_pregunta,
      data.pregunta_descripcion,
      data.respuesta_dada
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<respuesta, 'id_respuesta' | 'creado_at'>>): Promise<respuesta | null> {
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
    const query = `UPDATE respuesta SET ${sets.join(', ')} WHERE id_respuesta = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM respuesta WHERE id_respuesta = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
