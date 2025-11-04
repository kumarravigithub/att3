import { Storage } from '@google-cloud/storage';

let storage = null;
let bucket = null;

export function getStorage() {
  if (!storage) {
    const projectId = process.env.GCS_PROJECT_ID;
    const keyFilename = process.env.GCS_KEY_FILENAME;
    const googleApplicationCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    // Priority: GCS_KEY_FILENAME > GOOGLE_APPLICATION_CREDENTIALS > error
    // Always use a service account key file to avoid permission issues with user credentials
    if (keyFilename) {
      storage = new Storage({ projectId, keyFilename });
    } else if (googleApplicationCredentials) {
      // Use GOOGLE_APPLICATION_CREDENTIALS if set (should point to service account key)
      storage = new Storage({ projectId });
    } else {
      // Require explicit service account configuration
      throw new Error(
        'Google Cloud Storage service account key file is required. ' +
        'Please set either GCS_KEY_FILENAME or GOOGLE_APPLICATION_CREDENTIALS ' +
        'environment variable pointing to your service account JSON key file. ' +
        'Note: Application Default Credentials from gcloud auth may use your personal ' +
        'account which likely lacks storage permissions.'
      );
    }
  }
  
  return storage;
}

export function getBucket() {
  if (!bucket) {
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('GCS_BUCKET_NAME environment variable is not set');
    }
    
    const storage = getStorage();
    bucket = storage.bucket(bucketName);
  }
  
  return bucket;
}

