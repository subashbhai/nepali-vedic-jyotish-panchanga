# ==============================================================================
# Balananda Vaidik Sewa — Google Cloud Run Automated Deployment Script (PowerShell)
# ==============================================================================
$ErrorActionPreference = "Stop"

$ProjectId = "balananda-vaidik-sewa"
$Region = "asia-south1" # Mumbai (lowest latency to Nepal)
$ServiceName = "balananda-api"
$ImageTag = "gcr.io/$ProjectId/${ServiceName}:latest"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " BALANANDA VAIDIK SEWA — CLOUD RUN BACKEND DEPLOYMENT" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Check prerequisite gcloud CLI
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Error "gcloud CLI is not installed. Download from https://cloud.google.com/sdk/docs/install"
    exit 1
}

# 2. Set Project
Write-Host "[1/5] Setting Google Cloud Project to $ProjectId..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# 3. Enable Required APIs
Write-Host "[2/5] Enabling Cloud Run & Container Registry APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com containerregistry.googleapis.com

# 4. Build and Submit Container Image
Write-Host "[3/5] Submitting Container Image to Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --tag $ImageTag .

# 5. Deploy Service to Cloud Run
Write-Host "[4/5] Deploying Container to Cloud Run ($Region)..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
    --image $ImageTag `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --port 8080 `
    --memory 1Gi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 5 `
    --set-env-vars NODE_ENV=production

# 6. Retrieve Public Service URL
$BackendUrl = (gcloud run services describe $ServiceName --platform managed --region $Region --format 'value(status.url)').Trim()

Write-Host "======================================================================" -ForegroundColor Green
Write-Host " CLOUD RUN DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host " Backend Service URL: $BackendUrl" -ForegroundColor Green
Write-Host " Health Probe: $BackendUrl/api/health" -ForegroundColor Green
Write-Host ""
Write-Host "Next Step: Build and deploy the frontend with:" -ForegroundColor Cyan
Write-Host "  `$env:VITE_API_URL='$BackendUrl'; npm run build"
Write-Host "  firebase deploy --only hosting"
Write-Host "======================================================================" -ForegroundColor Green
