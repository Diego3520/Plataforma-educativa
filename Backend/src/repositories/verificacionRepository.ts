import pool from '../db';
import { verificacion } from '../models/verificacion';

export class verificacionRepository {
  async create(data: Omit<verificacion, 'id_verificacion' | 'creado_at'>): Promise<verificacion> {
    const query = `INSERT INTO verificaciones (id_usuario, codigo, expira_en, verificado)
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [
      data.id_usuario,
      data.codigo,
      data.expira_en,
      data.verificado
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async findByCodigo(codigo: string): Promise<verificacion | null> {
    const res = await pool.query('SELECT * FROM verificaciones WHERE codigo = $1', [codigo]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async update(id: number, data: Partial<verificacion>): Promise<verificacion | null> {
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
    const query = `UPDATE verificaciones SET ${sets.join(', ')} WHERE id_verificacion = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findById(id: number): Promise<verificacion | null> {
    const res = await pool.query('SELECT * FROM verificaciones WHERE id_verificacion = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByUsuarioId(usuarioId: number): Promise<verificacion[]> {
    const res = await pool.query('SELECT * FROM verificaciones WHERE id_usuario = $1', [usuarioId]);
    return res.rows;
  }
}