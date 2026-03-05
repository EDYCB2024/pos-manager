-- =====================================================
-- POS Manager — Schema inicial
-- Proyecto: vbqcahlqszcfqhlfmutq.supabase.co
-- =====================================================

CREATE TABLE IF NOT EXISTS public.casos_pos (
    id                  BIGSERIAL PRIMARY KEY,
    fecha               DATE NOT NULL DEFAULT CURRENT_DATE,
    aliado              TEXT,
    modelo              TEXT,
    razon_social        TEXT NOT NULL,
    serial              TEXT NOT NULL UNIQUE,
    informes            TEXT,
    rif                 TEXT,
    ingreso             TEXT,
    serial_reemplazo    TEXT,
    falla_notificada    TEXT,
    categoria           TEXT,
    fecha_final         DATE,
    estatus_caso        TEXT NOT NULL DEFAULT 'Abierto',
    estatus             TEXT NOT NULL DEFAULT 'Pendiente',
    nivel               TEXT,
    garantia            TEXT,
    informe             TEXT,
    cotizacion          TEXT,
    repuesto_1          TEXT,
    repuesto_2          TEXT,
    repuesto_3          TEXT,
    procesadora         TEXT,
    tecnico             TEXT,
    acepta_plan         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda rápida por serial
CREATE INDEX IF NOT EXISTS idx_casos_pos_serial
    ON public.casos_pos (serial);

-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.casos_pos;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.casos_pos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE public.casos_pos ENABLE ROW LEVEL SECURITY;

-- Política: acceso público por ahora (ajustar cuando agregues autenticación)
CREATE POLICY "Allow all operations"
    ON public.casos_pos
    FOR ALL
    USING (true)
    WITH CHECK (true);
