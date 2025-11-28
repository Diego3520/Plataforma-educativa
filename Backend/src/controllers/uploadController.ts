import { Request, Response } from 'express';
import { uploadService } from '../services/uploadService';

const service = new uploadService();

export class uploadController {
  static async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Archivo requerido' });
      }
      const creado = await service.uploadFile(req.file);
      return res.status(201).json(creado);
    } catch (error: any) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: error.message || 'Error guardando el archivo' });
    }
  }

  static async listar(req: Request, res: Response) {
    try {
      const archivos = await service.listUploads();
      return res.json(archivos);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
