$headers = @{
    "Authorization" = "Bearer sbp_3641981fce557b47fe19320831da1a6541547660"
    "Content-Type"  = "application/json"
}

# Verify table exists
$body = @{ query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'casos_pos' ORDER BY ordinal_position;" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/vbqcahlqszcfqhlfmutq/database/query" -Method POST -Headers $headers -Body $body | ConvertTo-Json -Depth 5
