# ==============================================================================
# TASK CONTROL — Windows Installer Build Script (Tauri 2 NSIS / MSI)
# ==============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   TASK CONTROL: WINDOWS INSTALLER PACKAGER (TAURI 2)           " -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ScriptDir "frontend"
$TauriDir = Join-Path $FrontendDir "src-tauri"
$DistInstallerDir = Join-Path $ScriptDir "dist-installer"

# Step 1: Check Rust / Cargo
Write-Host "`n[1/4] Checking Rust & Cargo compiler..." -ForegroundColor Yellow
$CargoPath = Get-Command cargo -ErrorAction SilentlyContinue

if (-not $CargoPath) {
    # Check default cargo location
    $DefaultCargo = "$env:USERPROFILE\.cargo\bin\cargo.exe"
    if (Test-Path $DefaultCargo) {
        $env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
        $CargoPath = Get-Command cargo -ErrorAction SilentlyContinue
    }
}

if (-not $CargoPath) {
    Write-Host "Rust compiler not detected on PATH." -ForegroundColor Yellow
    Write-Host "Downloading rustup-init.exe installer..." -ForegroundColor Cyan
    $RustupUrl = "https://win.rustup.rs/x86_64"
    $RustupInit = "$env:TEMP\rustup-init.exe"
    Invoke-WebRequest -Uri $RustupUrl -OutFile $RustupInit
    
    Write-Host "Installing Rust toolchain (stable-x86_64-pc-windows-msvc)..." -ForegroundColor Cyan
    Start-Process -FilePath $RustupInit -ArgumentList "-y", "--default-toolchain", "stable-x86_64-pc-windows-msvc" -Wait
    $env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
}

Write-Host "Rust compiler ready: $(cargo --version)" -ForegroundColor Green

# Step 2: Build Frontend
Write-Host "`n[2/4] Compiling frontend assets (Vite + React + Tailwind)..." -ForegroundColor Yellow
Set-Location $FrontendDir
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend compilation failed!"
    exit 1
}

# Step 3: Run Tauri 2 Build (Generates .exe and .msi)
Write-Host "`n[3/4] Packaging Windows Desktop Binary (.exe and .msi)..." -ForegroundColor Yellow
npm run tauri:build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Tauri packaging failed. Please check build logs."
    exit 1
}

# Step 4: Copy Installers to dist-installer/
Write-Host "`n[4/4] Collecting generated installers..." -ForegroundColor Yellow
if (-not (Test-Path $DistInstallerDir)) {
    New-Item -ItemType Directory -Path $DistInstallerDir -Force | Out-Null
}

$BundleDir = Join-Path $TauriDir "target\release\bundle"
if (Test-Path $BundleDir) {
    Get-ChildItem -Path $BundleDir -Recurse -Include *.exe, *.msi | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $DistInstallerDir -Force
        Write-Host "Ready Installer: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  SUCCESS! Windows installers generated in:                      " -ForegroundColor Green
Write-Host "  $DistInstallerDir                                              " -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan
