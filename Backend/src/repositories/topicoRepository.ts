import pool from '../db';
import { topico } from '../models/topico';

export class topicoRepository {
  async findAll(): Promise<topico[]> {
    const res = await pool.query('SELECT * FROM topico ORDER BY id_topico');
    return res.rows;
  }

  async findById(id: number): Promise<topico | null> {
    const res = await pool.query('SELECT * FROM topico WHERE id_topico = $1', [id]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async findByCursoId(cursoId: number): Promise<topico[]> {
    const res = await pool.query('SELECT * FROM topico WHERE id_curso = $1 ORDER BY orden', [cursoId]);
    return res.rows;
  }

  async findByCodigoCurso(codigo: string): Promise<topico | null> {
    const query = `
      SELECT t.* 
      FROM topico t
      INNER JOIN cursos c ON t.id_curso = c.id_curso
      WHERE c.codigo = $1 AND t.activo = true
      ORDER BY t.orden
      LIMIT 1
    `;
    const res = await pool.query(query, [codigo]);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async create(data: Omit<topico, 'id_topico' | 'creado_at'>): Promise<topico> {
    const query = `INSERT INTO topico (id_curso, orden, titulo, descripcion, material_id, activo)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      data.id_curso,
      data.orden,
      data.titulo,
      data.descripcion,
      data.material_id,
      data.activo
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async update(id: number, data: Partial<Omit<topico, 'id_topico' | 'creado_at'>>): Promise<topico | null> {
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
    const query = `UPDATE topico SET ${sets.join(', ')} WHERE id_topico = $${idx} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      return null;
    }
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM topico WHERE id_topico = $1', [id]);
    if (res.rowCount === 0) {
      return false;
    }
    return true;
  }
}
