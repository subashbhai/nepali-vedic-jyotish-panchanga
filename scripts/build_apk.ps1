# PowerShell script to build Android Debug APK for Balananda Jyotish
$ErrorActionPreference = 'Stop'

$javaHome = "C:\Program Files\Android\Android Studio\jbr"
$androidHome = "C:\Users\DELL-PC\AppData\Local\Android\Sdk"

Write-Host "Setting JAVA_HOME to: $javaHome"
$env:JAVA_HOME = $javaHome
Write-Host "Setting ANDROID_HOME to: $androidHome"
$env:ANDROID_HOME = $androidHome

$env:PATH = "$javaHome\bin;" + $env:PATH

Write-Host "Testing Java version:"
& "$javaHome\bin\java.exe" -version

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$androidDir = Join-Path $projectRoot "android"

Write-Host "Navigating to Android project directory: $androidDir"
Set-Location $androidDir

# Pre-build asset cleanup: Purge any old APK/EXE files and build outputs
$assetsDir = Join-Path $androidDir "app\src\main\assets"
if (Test-Path $assetsDir) {
    Write-Host "Purging nested APK/EXE files and old download caches from Android assets..."
    Get-ChildItem -Path $assetsDir -Include *.apk, *.exe -Recurse -File -ErrorAction SilentlyContinue | Remove-Item -Force
    $downloadsInAssets = Join-Path $assetsDir "public\downloads"
    if (Test-Path $downloadsInAssets) {
        Remove-Item -Path $downloadsInAssets -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Complete purge of old APK outputs prior to compilation
$oldApkOutput = Join-Path $androidDir "app\build\outputs\apk"
if (Test-Path $oldApkOutput) {
    Write-Host "Purging previous Gradle build APK outputs: $oldApkOutput"
    Remove-Item -Path $oldApkOutput -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Running Gradle clean assembleDebug directly via Java..."
& "$javaHome\bin\java.exe" "-Dorg.gradle.appname=gradlew" -jar "gradle\wrapper\gradle-wrapper.jar" clean assembleDebug --no-parallel --stacktrace
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

$apkPath = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host "SUCCESS! APK built at: $apkPath"
    $apkItem = Get-Item $apkPath
    $apkSize = $apkItem.Length
    $apkSizeMB = [math]::Round($apkSize / 1MB, 1)
    $apkSizeFormatted = "$apkSizeMB MB"
    $sha256 = (Get-FileHash -Path $apkPath -Algorithm SHA256).Hash.ToLower()

    Write-Host "Real compiled APK metrics:"
    Write-Host "  - Bytes: $apkSize"
    Write-Host "  - Formatted: $apkSizeFormatted"
    Write-Host "  - SHA256: $sha256"

    $publicDownloads = Join-Path $projectRoot "public\downloads"
    if (-not (Test-Path $publicDownloads)) {
        New-Item -ItemType Directory -Path $publicDownloads -Force | Out-Null
    }

    # Delete old downloads completely before copying newly compiled artifacts
    Get-ChildItem -Path $publicDownloads -Filter "*.apk" -File -ErrorAction SilentlyContinue | Remove-Item -Force

    $destApk = Join-Path $publicDownloads "balananda-jyotish-debug.apk"
    Copy-Item -Path $apkPath -Destination $destApk -Force
    $destApkStandard = Join-Path $publicDownloads "nepali-vedic-jyotish-panchanga.apk"
    Copy-Item -Path $apkPath -Destination $destApkStandard -Force
    Write-Host "Copied fresh APK to public downloads: $destApk and $destApkStandard ($apkSizeFormatted)"

    $distDownloads = Join-Path $projectRoot "dist\downloads"
    if (Test-Path $distDownloads) {
        Get-ChildItem -Path $distDownloads -Filter "*.apk" -File -ErrorAction SilentlyContinue | Remove-Item -Force
        Copy-Item -Path $apkPath -Destination (Join-Path $distDownloads "balananda-jyotish-debug.apk") -Force
        Copy-Item -Path $apkPath -Destination (Join-Path $distDownloads "nepali-vedic-jyotish-panchanga.apk") -Force
        Write-Host "Mirrored fresh APK to dist downloads for immediate server delivery."
    }

    # Automatically synchronize public/releases.json and dist/releases.json
    $releasesJsonPath = Join-Path $projectRoot "public\releases.json"
    if (Test-Path $releasesJsonPath) {
        try {
            $jsonContent = Get-Content -Path $releasesJsonPath -Raw | ConvertFrom-Json
            foreach ($rel in $jsonContent) {
                if ($rel.platform -eq "android") {
                    $rel.fileSizeBytes = $apkSize
                    $rel.fileSizeFormatted = $apkSizeFormatted
                    $rel.sha256Checksum = $sha256
                    $rel.publishedAtISO = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                }
            }
            $jsonContent | ConvertTo-Json -Depth 10 | Set-Content -Path $releasesJsonPath -Encoding UTF8
            Write-Host "Synchronized $releasesJsonPath with exact build metrics."

            $distReleasesJson = Join-Path $projectRoot "dist\releases.json"
            if (Test-Path $distReleasesJson) {
                Copy-Item -Path $releasesJsonPath -Destination $distReleasesJson -Force
                Write-Host "Synchronized $distReleasesJson with exact build metrics."
            }
        } catch {
            Write-Warning "Failed to auto-update releases.json: $_"
        }
    }
} else {
    Write-Error "APK file not found at expected location: $apkPath"
}
