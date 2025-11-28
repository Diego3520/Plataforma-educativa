import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadFileToCloudinary(filePath: string) {
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'educativa/uploads';
  const response: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
    resource_type: 'auto',
    folder,
    use_filename: true,
    unique_filename: false
  });
  return response;
}
