$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()
Write-Host "Gamza Local Web Server started at http://localhost:8000/"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $reqPath = $request.Url.LocalPath
    if ($reqPath -eq "/" -or $reqPath -eq "") {
        $reqPath = "/index.html"
    }
    
    $localPath = Join-Path $PSScriptRoot ($reqPath.TrimStart('/'))
    
    if (Test-Path $localPath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($localPath)
        $ext = [System.IO.Path]::GetExtension($localPath)
        switch ($ext.ToLower()) {
            ".html" { $response.ContentType = "text/html; charset=utf-8" }
            ".css"  { $response.ContentType = "text/css; charset=utf-8" }
            ".js"   { $response.ContentType = "text/javascript; charset=utf-8" }
            ".png"  { $response.ContentType = "image/png" }
            ".jpg"  { $response.ContentType = "image/jpeg" }
            ".svg"  { $response.ContentType = "image/svg+xml" }
            default { $response.ContentType = "application/octet-stream" }
        }
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $notFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($notFoundMsg, 0, $notFoundMsg.Length)
    }
    $response.Close()
}
