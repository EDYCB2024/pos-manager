$headers = @{
    "Authorization" = "Bearer sb_secret_VEGgu0ohhhf4foqHVGTsYQ_bEzxlSs5"
    "Content-Type"  = "application/json"
}

# Step 1: Check existing tables
$checkBody = @{ query = "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';" } | ConvertTo-Json
Write-Host "=== Checking existing tables ==="
try {
    $result = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/vbqcahlqszcfqhlfmutq/database/query" -Method POST -Headers $headers -Body $checkBody
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_"
}

# Step 2: Create the casos_pos table
$createSQL = @"
CREATE TABLE IF NOT EXISTS public.casos_pos (
    id              BIGSERIAL PRIMARY KEY,
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    aliado          TEXT,
    modelo          TEXT,
    razon_social    TEXT NOT NULL,
    serial          TEXT NOT NULL UNIQUE,
    informes        TEXT,
    rif             TEXT,
    serial_reemplazo TEXT,
    falla_notificada TEXT,
    categoria       TEXT,
    estatus_caso    TEXT DEFAULT 'Abierto',
    estatus_reparacion TEXT DEFAULT 'Pendiente',
    garantia        BOOLEAN DEFAULT FALSE,
    cotizacion      NUMERIC(12, 2) DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast serial lookup
CREATE INDEX IF NOT EXISTS idx_casos_pos_serial ON public.casos_pos (serial);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS 'BEGIN NEW.updated_at = NOW(); RETURN NEW; END;' LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.casos_pos;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.casos_pos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.casos_pos ENABLE ROW LEVEL SECURITY;

-- Public read/write policy (adjust later for auth)
CREATE POLICY IF NOT EXISTS "Allow all operations" ON public.casos_pos FOR ALL USING (true) WITH CHECK (true);
"@

$createBody = @{ query = $createSQL } | ConvertTo-Json -Depth 3
Write-Host "`n=== Creating casos_pos table ==="
try {
    $result2 = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/vbqcahlqszcfqhlfmutq/database/query" -Method POST -Headers $headers -Body $createBody
    Write-Host "SUCCESS:"
    $result2 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error creating table: $_"
    $_.Exception.Response | ConvertTo-Json
}
