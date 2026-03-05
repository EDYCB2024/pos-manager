-- Limpiar campo 'acepta_plan' para registros existentes
UPDATE public.casos_pos 
SET acepta_plan = NULL;
