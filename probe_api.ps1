$headers = @{
    "Authorization" = "Bearer sb_secret_VEGgu0ohhhf4foqHVGTsYQ_bEzxlSs5"
    "Content-Type"  = "application/json"
}

# Get project info including API keys
Write-Host "=== Getting project details ==="
try {
    $result = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/vbqcahlqszcfqhlfmutq" -Method GET -Headers $headers
    $result | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Project endpoint error: $($_.Exception.Message)"
}

Write-Host "`n=== Trying pg-meta endpoint ==="
try {
    $result2 = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/vbqcahlqszcfqhlfmutq/postgres/tables" -Method GET -Headers $headers
    $result2 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "pg-meta error: $($_.Exception.Message)"
}
