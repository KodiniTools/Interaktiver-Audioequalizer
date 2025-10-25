# Audio Equalizer Vue - Deployment Script

Write-Host "Starting deployment process..." -ForegroundColor Green

# 1. Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# 2. Install terser for production build
Write-Host "Ensuring terser is installed..." -ForegroundColor Yellow
npm install -D terser

# 3. Build the project
Write-Host "Building project for production..." -ForegroundColor Green
npm run build

if (0 -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Upload the 'dist' folder to your hosting service (Vercel, Netlify, etc.)" -ForegroundColor White
    Write-Host "2. Or run: vercel --prod (if you have Vercel CLI installed)" -ForegroundColor White
    Write-Host ""
    Write-Host "Build files are in: C:\Users\User\audio-equalizer-vue\dist" -ForegroundColor Yellow
} else {
    Write-Host "Build failed! Please check the error messages above." -ForegroundColor Red
    exit 1
}
