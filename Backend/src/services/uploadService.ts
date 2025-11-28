import { Express } from 'express';
import path from 'path';
import { uploadRepository } from '../repositories/uploadRepository';
import { uploadFileToCloudinary } from '../utils/cloudinary';

export class uploadService {
  private repo: uploadRepository;

  constructor() {
    this.repo = new uploadRepository();
  }

  async uploadFile(file: Express.Multer.File) {
    const uploaded = await uploadFileToCloudinary(file.path);
    const relativePath = path.relative(process.cwd(), file.path);
    return await this.repo.create({
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      local_path: relativePath,
      cloud_url: uploaded.secure_url,
      cloud_public_id: uploaded.public_id
    });
  }

  async listUploads() {
    return await this.repo.findAll();
  }
}
