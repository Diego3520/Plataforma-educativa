import pool from '../db';
import { inscrito } from '../models/inscrito';

export class inscritoRepository {
  async findAll(): Promise<inscrito[]> {
    const res = await pool.query('SELECT * FROM inscritos ORDER BY id_inscritos');
    return res.rows;
  }

  async findById(id: number): Promise<inscrito | null> {
    const res = await pool.query('SELECT * FROM inscritos WHERE id_inscritos = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByUsuarioId(usuarioId: number): Promise<inscrito[]> {
    const res = await pool.query('SELECT * FROM inscritos WHERE id_usuario = $1 ORDER BY fecha_inscripcion', [usuarioId]);
    return res.rows;
  }

  async findByTopicoId(topicoId: number): Promise<inscrito[]> {
    const res = await pool.query('SELECT * FROM inscritos WHERE id_topico = $1 ORDER BY fecha_inscripcion', [topicoId]);
    return res.rows;
  }

  async create(data: Omit<inscrito, 'id_inscritos' | 'fecha_inscripcion'>): Promise<inscrito> {
    const query = `INSERT INTO inscritos (id_topico, id_usuario)
      VALUES ($1, $2) RETURNING *`;
    const values = [data.id_topico, data.id_usuario];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<inscrito, 'id_inscritos' | 'fecha_inscripcion'>>): Promise<inscrito | null> {
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
    const query = `UPDATE inscritos SET ${sets.join(', ')} WHERE id_inscritos = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM inscritos WHERE id_inscritos = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
