import pool from '../db';
import { diagnostico } from '../models/diagnostico';

export class diagnosticoRepository {
  async findAll(): Promise<diagnostico[]> {
    const res = await pool.query('SELECT * FROM diagnostico ORDER BY id_diagnostico');
    return res.rows;
  }

  async findById(id: number): Promise<diagnostico | null> {
    const res = await pool.query('SELECT * FROM diagnostico WHERE id_diagnostico = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByTopicoId(topicoId: number): Promise<diagnostico[]> {
    const res = await pool.query('SELECT * FROM diagnostico WHERE id_topico = $1 ORDER BY fecha_diagnostico', [topicoId]);
    return res.rows;
  }

  async findByDiagnosticadorId(diagnosticadorId: number): Promise<diagnostico[]> {
    const res = await pool.query('SELECT * FROM diagnostico WHERE id_diagnosticador = $1 ORDER BY fecha_diagnostico', [diagnosticadorId]);
    return res.rows;
  }

  async create(data: Omit<diagnostico, 'id_diagnostico' | 'fecha_diagnostico'>): Promise<diagnostico> {
    const query = `INSERT INTO diagnostico (id_topico, id_diagnosticador, nota_diagn, descripcion)
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [
      data.id_topico,
      data.id_diagnosticador,
      data.nota_diagn,
      data.descripcion
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<diagnostico, 'id_diagnostico' | 'fecha_diagnostico'>>): Promise<diagnostico | null> {
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
    const query = `UPDATE diagnostico SET ${sets.join(', ')} WHERE id_diagnostico = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM diagnostico WHERE id_diagnostico = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
