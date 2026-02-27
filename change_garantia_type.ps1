$headers = @{
    "Authorization" = "Bearer sbp_3641981fce557b47fe19320831da1a6541547660"
    "Content-Type"  = "application/json"
}

$sql = "ALTER TABLE public.casos_pos ALTER COLUMN garantia TYPE TEXT USING (CASE WHEN garantia THEN 'Sí' ELSE 'No' END);"
$body = @{ query = $sql } | ConvertTo-Json

Write-Host "Running: $sql"
try {
    $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/vbqcahlqszcfqhlfmutq/sql" -Method Post -Headers $headers -Body $body
    Write-Host "SUCCESS"
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        $details = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Details: $($details.error)"
    }
}
