import { Storage } from '@google-cloud/storage';

let storage = null;
let bucket = null;

export function getStorage() {
  if (!storage) {
    const projectId = process.env.GCS_PROJECT_ID;
    const keyFilename = process.env.GCS_KEY_FILENAME;
    const serviceAccountJson = process.env.GCS_SERVICE_ACCOUNT_JSON;
    const googleApplicationCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    // Priority: GCS_SERVICE_ACCOUNT_JSON > GCS_KEY_FILENAME > GOOGLE_APPLICATION_CREDENTIALS > error
    // For deployment, use GCS_SERVICE_ACCOUNT_JSON (entire JSON content as env var)
    // For local dev, use GCS_KEY_FILENAME (path to JSON file)
    if (serviceAccountJson) {
      // Parse JSON from environment variable (for deployment)
      try {
        const credentials = JSON.parse(serviceAccountJson);
        storage = new Storage({ 
          projectId, 
          credentials 
        });
      } catch (error) {
        throw new Error(
          'Failed to parse GCS_SERVICE_ACCOUNT_JSON. ' +
          'Ensure it contains valid JSON content of your service account key file.'
        );
      }
    } else if (keyFilename) {
      // Use file path (for local development)
      storage = new Storage({ projectId, keyFilename });
    } else if (googleApplicationCredentials) {
      // Use GOOGLE_APPLICATION_CREDENTIALS if set (should point to service account key)
      storage = new Storage({ projectId });
    } else {
      // Require explicit service account configuration
      throw new Error(
        'Google Cloud Storage service account credentials are required. ' +
        'Please set one of: GCS_SERVICE_ACCOUNT_JSON (for deployment), ' +
        'GCS_KEY_FILENAME (for local dev), or GOOGLE_APPLICATION_CREDENTIALS ' +
        'environment variable. ' +
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

