$headers = @{
    "Authorization" = "Bearer sbp_3641981fce557b47fe19320831da1a6541547660"
    "Content-Type"  = "application/json"
}

# Step 1: Check existing tables
$checkBody = @{ query = "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';" } | ConvertTo-Json
Write-Host "=== Checking existing tables ==="
try {
    $result = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/vbqcahlqszcfqhlfmutq/database/query" -Method POST -Headers $headers -Body $checkBody
    $result | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "Error: $_"
}

# Step 2: Create/Update the table and columns
$queries = @(
    "CREATE TABLE IF NOT EXISTS public.casos_pos (id BIGSERIAL PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS fecha DATE NOT NULL DEFAULT CURRENT_DATE;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS aliado TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS modelo TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS razon_social TEXT NOT NULL DEFAULT '';",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS serial TEXT NOT NULL DEFAULT '';",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS informes TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS rif TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS ingreso TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS serial_reemplazo TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS falla_notificada TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS categoria TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS fecha_final DATE;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS estatus_caso TEXT NOT NULL DEFAULT 'Abierto';",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS estatus TEXT NOT NULL DEFAULT 'Pendiente';",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS nivel TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS garantia BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS informe TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS cotizacion NUMERIC(12, 2) DEFAULT 0;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS repuesto_1 TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS repuesto_2 TEXT;",
    "ALTER TABLE public.casos_pos ADD COLUMN IF NOT EXISTS repuesto_3 TEXT;",
    "ALTER TABLE public.casos_pos ADD CONSTRAINT IF NOT EXISTS casos_pos_serial_key UNIQUE (serial);",
    "CREATE INDEX IF NOT EXISTS idx_casos_pos_serial ON public.casos_pos (serial);",
    "CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS 'BEGIN NEW.updated_at = NOW(); RETURN NEW; END;' LANGUAGE plpgsql;",
    "DROP TRIGGER IF EXISTS set_updated_at ON public.casos_pos;",
    "CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.casos_pos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();",
    "ALTER TABLE public.casos_pos ENABLE ROW LEVEL SECURITY;",
    "DROP POLICY IF EXISTS 'Allow all operations' ON public.casos_pos;",
    "CREATE POLICY 'Allow all operations' ON public.casos_pos FOR ALL USING (true) WITH CHECK (true);"
)

Write-Host "`n=== Executing SQL Queries ==="
foreach ($sql in $queries) {
    # Skip Empty strings
    if (-not $sql.Trim()) { continue }
    
    Write-Host "Running: $($sql.Substring(0, [Math]::Min($sql.Length, 50)))..."
    $body = @{ query = $sql } | ConvertTo-Json -Depth 3
    try {
        $res = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/vbqcahlqszcfqhlfmutq/database/query" -Method POST -Headers $headers -Body $body
        Write-Host "SUCCESS"
    }
    catch {
        # Check if error is 'column already exists' or similar expected errors
        if ($_.Exception.Message -match "already exists") {
            Write-Host "SKIPPED (already exists)"
        }
        else {
            Write-Host "ERROR: $($_.Exception.Message)"
            if ($_.Exception.Response) {
                $_.Exception.Response.Content.ReadAsStringAsync().Result | Write-Host
            }
        }
    }
}
