$headers = @{
    "Authorization" = "Bearer sbp_3641981fce557b47fe19320831da1a6541547660"
    "Content-Type"  = "application/json"
}

$sql = "ALTER TABLE public.casos_pos DROP CONSTRAINT IF EXISTS casos_pos_serial_key;"
$body = @{ query = $sql } | ConvertTo-Json

Write-Host "Running: $sql"
try {
    $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/vbqcahlqszcfqhlfmutq/sql" -Method Post -Headers $headers -Body $body
    Write-Host "SUCCESS"
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
