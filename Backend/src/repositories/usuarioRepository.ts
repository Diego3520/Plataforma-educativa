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

    // MODIFICADO: Ahora incluye google_id y microsoft_id
    async create(data: Omit<usuario, 'id_usuario' | 'creado_at'>): Promise<usuario> {
        const query = `INSERT INTO usuarios
                       (cod_sis, descripcion, nombre, apellido, tipo, correo, activo, password_hash, google_id, microsoft_id)
                       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
        const values = [
            data.cod_sis ?? null,
            data.descripcion ?? null,
            data.nombre,
            data.apellido,
            data.tipo,
            data.correo ?? null,
            data.activo ?? true,
            data.password_hash ?? null,
            data.google_id ?? null,
            data.microsoft_id ?? null
        ];
        console.log('INSERT values:', values); // <-- LOG ANTES DEL QUERY
        const res = await pool.query(query, values);
        return res.rows[0];
    }

    async update(id: number, data: Partial<Omit<usuario, 'id_usuario' | 'creado_at'>>): Promise<usuario | null> {
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
        console.log('UPDATE values:', values); // <-- LOG ANTES DEL QUERY
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

    async findByCorreo(correo: string): Promise<usuario | null> {
        const res = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (res.rowCount === 0) {
            return null;
        }
        return res.rows[0];
    }
}