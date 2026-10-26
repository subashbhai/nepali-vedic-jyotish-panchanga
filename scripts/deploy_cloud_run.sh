#!/bin/bash
# ==============================================================================
# Balananda Vaidik Sewa — Google Cloud Run Automated Deployment Script
# ==============================================================================
set -e

PROJECT_ID="balananda-vaidik-sewa"
REGION="asia-south1" # Mumbai (lowest latency to Nepal)
SERVICE_NAME="balananda-api"
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "======================================================================"
echo " BALANANDA VAIDIK SEWA — CLOUD RUN BACKEND DEPLOYMENT"
echo "======================================================================"

# 1. Check prerequisite gcloud CLI
if ! command -v gcloud &> /dev/null; then
  echo "Error: gcloud CLI is not installed."
  echo "Download from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# 2. Check billing prerequisite
echo "[1/5] Verifying Google Cloud Project..."
gcloud config set project "${PROJECT_ID}"

# 3. Enable Required APIs (Cloud Run, Container Registry / Artifact Registry)
echo "[2/5] Enabling Cloud Run & Container APIs..."
gcloud services enable run.googleapis.com containerregistry.googleapis.com

# 4. Build and Submit Container Image
echo "[3/5] Submitting Container Image to Google Cloud Build..."
gcloud builds submit --tag "${IMAGE_TAG}" .

# 5. Deploy Service to Cloud Run
echo "[4/5] Deploying Container to Cloud Run (${REGION})..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_TAG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars NODE_ENV=production

# 6. Retrieve Public Service URL
BACKEND_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format 'value(status.url)')

echo "======================================================================"
echo " CLOUD RUN DEPLOYMENT SUCCESSFUL!"
echo " Backend Service URL: ${BACKEND_URL}"
echo " Health Probe: ${BACKEND_URL}/api/health"
echo ""
echo "Next Step: Build and deploy the frontend with:"
echo "  VITE_API_URL=\"${BACKEND_URL}\" npm run build"
echo "  firebase deploy --only hosting"
echo "======================================================================"
