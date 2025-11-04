# Deployment Guide

This guide explains how to deploy the AnyTimeTeacher application, specifically handling the Google Cloud Storage service account credentials securely.

## Overview

The `gcs-service-account.json` file is **not** committed to the repository for security reasons. Instead, we use environment variables to provide credentials during deployment.

## Deployment Options

### Option 1: Environment Variable (Recommended for Production)

Use the `GCS_SERVICE_ACCOUNT_JSON` environment variable to pass the entire service account JSON content.

#### Step 1: Prepare the JSON String

Convert your `gcs-service-account.json` file to a single-line JSON string:

**On macOS/Linux:**
```bash
cat gcs-service-account.json | jq -c
```

**Or manually:**
- Copy the entire JSON content
- Remove all newlines and extra spaces
- Ensure it's valid JSON

**Example:**
```json
{"type":"service_account","project_id":"anytime-teacher-ai","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

#### Step 2: Set Environment Variable

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add new variable:
   - Name: `GCS_SERVICE_ACCOUNT_JSON`
   - Value: (paste the minified JSON string)
   - Environment: Production, Preview, Development (as needed)

**Railway:**
1. Go to Project → Variables
2. Add `GCS_SERVICE_ACCOUNT_JSON` with the JSON string value

**Render:**
1. Go to Environment → Environment Variables
2. Add `GCS_SERVICE_ACCOUNT_JSON` with the JSON string value

**Docker:**
```bash
docker run -e GCS_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' your-image
```

**Docker Compose:**
```yaml
services:
  app:
    environment:
      - GCS_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

**Kubernetes Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gcs-credentials
type: Opaque
stringData:
  GCS_SERVICE_ACCOUNT_JSON: |
    {"type":"service_account",...}
```

### Option 2: File Path (Local Development Only)

For local development, you can use the file path:

```env
GCS_KEY_FILENAME=./gcs-service-account.json
```

This requires the `gcs-service-account.json` file to exist in your project root (which is already `.gitignore`d).

### Option 3: Google Application Default Credentials

If running on Google Cloud Platform (GCP), you can use Application Default Credentials:

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## Priority Order

The code checks for credentials in this order:
1. `GCS_SERVICE_ACCOUNT_JSON` (environment variable with JSON content)
2. `GCS_KEY_FILENAME` (path to JSON file)
3. `GOOGLE_APPLICATION_CREDENTIALS` (GCP default credentials)

## Verification

After deployment, verify the storage connection works by:
1. Testing file upload functionality
2. Checking application logs for any GCS-related errors
3. Verifying files appear in your GCS bucket

## Security Best Practices

1. **Never commit** `gcs-service-account.json` to version control (already in `.gitignore`)
2. **Use environment variables** for production deployments
3. **Rotate credentials** regularly
4. **Limit permissions** - Only grant the service account the minimum permissions needed
5. **Use secrets management** services (AWS Secrets Manager, Google Secret Manager) when possible
6. **Monitor access** - Review service account usage in Google Cloud Console

## Troubleshooting

### Error: "Google Cloud Storage service account credentials are required"

**Solution**: Ensure one of the following is set:
- `GCS_SERVICE_ACCOUNT_JSON` environment variable
- `GCS_KEY_FILENAME` environment variable pointing to a valid file
- `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### Error: "Failed to parse GCS_SERVICE_ACCOUNT_JSON"

**Solution**: 
- Ensure the JSON is valid and properly escaped
- Check for newlines - they should be escaped as `\n`
- Verify the JSON is on a single line or properly formatted
- Use `jq -c` to minify the JSON correctly

### Error: "Permission denied" or "Access denied"

**Solution**:
- Verify the service account has the correct IAM roles:
  - `Storage Object Admin` or `Storage Admin` for full access
  - `Storage Object Creator` for upload-only
- Check that the service account email matches in Google Cloud Console
- Verify the bucket name and project ID are correct

