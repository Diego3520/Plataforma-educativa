import pool from '../db';
import { usuario } from '../models/usuario';

export class usuarioRepository {
  async findAll(): Promise<usuario[]> {
    const res = await pool.query('SELECT * FROM usuarios ORDER BY id_usuario');
    return res.rows;
  }

  async findById(id: number): Promise<usuario | null> {
    const res = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async create(data: Omit<usuario, 'id_usuario' | 'creado_at'>): Promise<usuario> {
    const query = `INSERT INTO usuarios (cod_sis, descripcion, nombre, apellido, tipo, correo, activo)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const values = [
      data.cod_sis,
      data.descripcion,
      data.nombre,
      data.apellido,
      data.tipo,
      data.correo,
      data.activo
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<usuario, 'id_usuario' | 'creado_at'>>): Promise<usuario | null> {
    // Construir SET dinamico
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
    const query = `UPDATE usuarios SET ${sets.join(', ')} WHERE id_usuario = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
