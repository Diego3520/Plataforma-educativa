import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/uploadController';
import { uploadsDir } from '../utils/uploadsPath';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}_${sanitized}`);
  }
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_UPLOAD_BYTES || '52428800', 10) }
});

router.post('/', uploadMiddleware.single('file'), uploadController.uploadFile);
router.get('/', uploadController.listar);

export default router;
