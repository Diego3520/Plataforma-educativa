import pool from '../db';
import { uploadRecord } from '../models/upload';

export class uploadRepository {
  async create(data: Omit<uploadRecord, 'upload_id' | 'creado_at'>): Promise<uploadRecord> {
    const query = `INSERT INTO uploads (original_name, mime_type, size, local_path, cloud_url, cloud_public_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      data.original_name,
      data.mime_type,
      data.size,
      data.local_path,
      data.cloud_url,
      data.cloud_public_id
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async findAll(): Promise<uploadRecord[]> {
    const res = await pool.query('SELECT * FROM uploads ORDER BY creado_at DESC');
    return res.rows;
  }
}
