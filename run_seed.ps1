# Load .ENV file if present
$envPath = Join-Path $PSScriptRoot ".ENV"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)\s*$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
        }
    }
}

$token = $env:SUPABASE_ACCESS_TOKEN
$projectRef = $env:SUPABASE_PROJECT_REF

if (-not $token) {
    Write-Error "SUPABASE_ACCESS_TOKEN is not set."
    exit 1
}

$filePath = Join-Path $PSScriptRoot "seed_utf8.sql"
if (-not (Test-Path $filePath)) {
    Write-Error "seed_utf8.sql not found."
    exit 1
}

$sql = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

$payloadObj = @{ query = $sql }
$jsonPayload = $payloadObj | ConvertTo-Json -Compress
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonPayload)

$headers = @{
    "Authorization" = "Bearer $token"
}

$response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$projectRef/database/query" -Method Post -Headers $headers -ContentType "application/json; charset=utf-8" -Body $bodyBytes
Write-Host "Successfully executed SQL seed with clean UTF-8!"
