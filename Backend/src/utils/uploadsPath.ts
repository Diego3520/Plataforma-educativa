import fs from 'fs';
import path from 'path';

export const uploadsDir = path.resolve(process.cwd(), process.env.UPLOADS_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
