$url = 'http://localhost:9001/api/generate'

$messages = @(
    'Hello! This is Gordon testing the dashboard live.',
    'I can see the chat interface is working great.',
    'Testing performance and interaction logging.',
    'This message should appear in your browser chat window.',
    'Interaction captured and logged for dataset.'
)

Write-Host "================================"
Write-Host "Gordon Live Testbench - Sending Messages"
Write-Host "================================"
Write-Host ""

foreach ($msg in $messages) {
    Write-Host "[SENDING] $msg"
    
    $body = @{
        model = 'qwen2.5:7b'
        prompt = $msg
        stream = $false
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 30
        $result = $response.Content | ConvertFrom-Json
        
        Write-Host "[RESPONSE] $($result.response.Substring(0, 100))..." -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "[ERROR] Failed to send: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}

Write-Host "================================"
Write-Host "Test Complete"
Write-Host "================================"
