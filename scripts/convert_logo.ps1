Add-Type -AssemblyName System.Drawing

$publicDir = (Get-Item ".\public").FullName
$srcFile = Join-Path $publicDir "logo.jpg"
if (-not (Test-Path $srcFile)) {
    $srcFile = Join-Path $publicDir "logo.png"
}

Write-Output "Reading from: $srcFile"
$bytes = [System.IO.File]::ReadAllBytes($srcFile)
$ms = New-Object System.IO.MemoryStream
$ms.Write($bytes, 0, $bytes.Length)
$ms.Position = 0

$img = [System.Drawing.Image]::FromStream($ms)
Write-Output "Image loaded successfully: $($img.Width) x $($img.Height)"

# 1. Save true PNG
$pngMs = New-Object System.IO.MemoryStream
$img.Save($pngMs, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $pngMs.ToArray()

[System.IO.File]::WriteAllBytes((Join-Path $publicDir "logo.png"), $pngBytes)
[System.IO.File]::WriteAllBytes((Join-Path $publicDir "balananda-logo.png"), $pngBytes)
[System.IO.File]::WriteAllBytes((Join-Path $publicDir "assets\logo.png"), $pngBytes)
Write-Output "Saved true PNG logo to public/logo.png and public/assets/logo.png"

# 2. Generate resized PWA icons
$sizes = @(192, 512)
foreach ($size in $sizes) {
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $size, $size)
    $g.Dispose()

    $pwaMs = New-Object System.IO.MemoryStream
    $resized.Save($pwaMs, [System.Drawing.Imaging.ImageFormat]::Png)
    $resized.Dispose()
    
    [System.IO.File]::WriteAllBytes((Join-Path $publicDir "pwa-${size}x${size}.png"), $pwaMs.ToArray())
    if ($size -eq 512) {
        [System.IO.File]::WriteAllBytes((Join-Path $publicDir "pwa-maskable-512x512.png"), $pwaMs.ToArray())
    }
    Write-Output "Saved pwa-${size}x${size}.png"
}

# 3. Apple Touch Icon (180x180)
$appleBmp = New-Object System.Drawing.Bitmap(180, 180)
$g = [System.Drawing.Graphics]::FromImage($appleBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, 180, 180)
$g.Dispose()
$appleMs = New-Object System.IO.MemoryStream
$appleBmp.Save($appleMs, [System.Drawing.Imaging.ImageFormat]::Png)
$appleBmp.Dispose()
[System.IO.File]::WriteAllBytes((Join-Path $publicDir "apple-touch-icon.png"), $appleMs.ToArray())
Write-Output "Saved apple-touch-icon.png"

# 4. True Favicon / Windows Icon (.ico)
$icoBmp = New-Object System.Drawing.Bitmap(256, 256)
$g = [System.Drawing.Graphics]::FromImage($icoBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, 256, 256)
$g.Dispose()

$hIcon = $icoBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$icoMs = New-Object System.IO.MemoryStream
$icon.Save($icoMs)
$icon.Dispose()
$icoBmp.Dispose()
[System.IO.File]::WriteAllBytes((Join-Path $publicDir "favicon.ico"), $icoMs.ToArray())
Write-Output "Saved true favicon.ico (256x256 icon)"

$img.Dispose()
$ms.Dispose()
Write-Output "ALL ICONS GENERATED SUCCESSFULLY!"
