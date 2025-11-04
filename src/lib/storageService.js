import { getBucket } from './storage.js';
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(buffer, originalFileName) {
  const bucket = getBucket();
  const fileExtension = originalFileName.split('.').pop();
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  const blob = bucket.file(`chapters/${uniqueFileName}`);
  
  return new Promise((resolve, reject) => {
    const stream = blob.createWriteStream({
      metadata: {
        contentType: 'application/pdf',
      },
      public: false, // Files are private
    });

    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('finish', async () => {
      const fileUrl = `gs://${bucket.name}/${blob.name}`;
      resolve({ fileUrl, fileName: uniqueFileName });
    });

    stream.end(buffer);
  });
}

export async function getSignedUrl(fileUrl, expirationMinutes = 60) {
  const bucket = getBucket();
  const fileName = fileUrl.split('/').pop();
  const file = bucket.file(`chapters/${fileName}`);
  
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expirationMinutes * 60 * 1000,
  });

  return url;
}

export async function deleteFile(fileUrl) {
  try {
    const bucket = getBucket();
    const fileName = fileUrl.split('/').pop();
    const file = bucket.file(`chapters/${fileName}`);
    await file.delete();
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

