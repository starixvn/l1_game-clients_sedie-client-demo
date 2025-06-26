# RNG Soccer Simulator Startup Script
# This script starts the development server with simulator mode enabled for RNG Soccer

Write-Host "🎮 Starting RNG Soccer Simulator..." -ForegroundColor Green

# Set environment variables for simulator mode
$env:NODE_ENV = "development"
$env:SIMULATOR_CONFIG = '{"simulationMode":{"enabled":true},"simulatorConfigs":{"enabled":true,"defaultGameType":"rng-soccer"}}'

Write-Host "✅ Environment variables set:" -ForegroundColor Yellow
Write-Host "   NODE_ENV: $env:NODE_ENV" -ForegroundColor Cyan
Write-Host "   SIMULATOR_CONFIG: $env:SIMULATOR_CONFIG" -ForegroundColor Cyan

# Check if we're in the right directory
$currentDir = Get-Location
Write-Host "📁 Current directory: $currentDir" -ForegroundColor Yellow

# Navigate to the hot-league-wall directory
$targetDir = "seal-monorepo/libs/hot-league-wall"

# Check if the target directory exists
if (Test-Path $targetDir) {
    Set-Location $targetDir
    Write-Host "📁 Changed to directory: $(Get-Location)" -ForegroundColor Yellow
}
else {
    Write-Host "❌ Error: Directory '$targetDir' not found!" -ForegroundColor Red
    Write-Host "💡 Make sure you're running this script from the project root directory" -ForegroundColor Yellow
    Write-Host "💡 Expected path: $(Join-Path (Get-Location) $targetDir)" -ForegroundColor Yellow
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found in current directory!" -ForegroundColor Red
    Write-Host "💡 Make sure you're in the correct project directory" -ForegroundColor Yellow
    exit 1
}

# Check if the start-hot-league script exists
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if (-not $packageJson.scripts.'start-hot-league') {
    Write-Host "❌ Error: 'start-hot-league' script not found in package.json!" -ForegroundColor Red
    Write-Host "💡 Available scripts:" -ForegroundColor Yellow
    $packageJson.scripts | Get-Member -MemberType NoteProperty | ForEach-Object {
        Write-Host "   - $($_.Name)" -ForegroundColor Cyan
    }
    exit 1
}

Write-Host "✅ Package.json found with start-hot-league script" -ForegroundColor Green

# Start the development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "🌐 Server will be available at: http://localhost:4201" -ForegroundColor Cyan
Write-Host "🎮 RNG Soccer Simulator will be available at: http://localhost:4201?page=rng-soccer-simulator" -ForegroundColor Cyan
Write-Host "📋 Simulator Test Page will be available at: http://localhost:4201?page=simulator" -ForegroundColor Cyan
Write-Host "⏹️  Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Run the npm command
npm run start-hot-league

Write-Host ""
Write-Host "🏁 Script execution completed" -ForegroundColor Green
Write-Host "💡 If you see errors above, please check:" -ForegroundColor Yellow
Write-Host "   1. You're running from the correct directory" -ForegroundColor Cyan
Write-Host "   2. Node.js and npm are installed" -ForegroundColor Cyan
Write-Host "   3. Dependencies are installed (run 'npm install' if needed)" -ForegroundColor Cyan
Write-Host "   4. The package.json file exists and has the correct scripts" -ForegroundColor Cyan

# Keep the window open
Write-Host ""
Write-Host "⏸️  Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 