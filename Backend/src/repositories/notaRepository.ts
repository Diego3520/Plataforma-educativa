import pool from '../db';
import { nota } from '../models/nota';

export class notaRepository {
  async findAll(): Promise<nota[]> {
    const res = await pool.query('SELECT * FROM nota ORDER BY id_nota');
    return res.rows;
  }

  async findById(id: number): Promise<nota | null> {
    const res = await pool.query('SELECT * FROM nota WHERE id_nota = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByInscritoId(inscritoId: number): Promise<nota[]> {
    const res = await pool.query('SELECT * FROM nota WHERE inscrito_id = $1 ORDER BY fecha_registro', [inscritoId]);
    return res.rows;
  }

  async findByTareaId(tareaId: number): Promise<nota[]> {
    const res = await pool.query('SELECT * FROM nota WHERE tarea_id = $1 ORDER BY fecha_registro', [tareaId]);
    return res.rows;
  }

  async findByEvaluacionId(evaluacionId: number): Promise<nota[]> {
    const res = await pool.query('SELECT * FROM nota WHERE evaluacion_id = $1 ORDER BY fecha_registro', [evaluacionId]);
    return res.rows;
  }

  async findByTopicoId(topicoId: number): Promise<nota[]> {
    const res = await pool.query('SELECT * FROM nota WHERE topico_id = $1 ORDER BY fecha_registro', [topicoId]);
    return res.rows;
  }

  async create(data: Omit<nota, 'id_nota' | 'fecha_registro'>): Promise<nota> {
    const query = `INSERT INTO nota (nota, tarea_id, evaluacion_id, inscrito_id, topico_id, comentario)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      data.nota,
      data.tarea_id,
      data.evaluacion_id,
      data.inscrito_id,
      data.topico_id,
      data.comentario
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<nota, 'id_nota' | 'fecha_registro'>>): Promise<nota | null> {
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
    const query = `UPDATE nota SET ${sets.join(', ')} WHERE id_nota = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM nota WHERE id_nota = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
