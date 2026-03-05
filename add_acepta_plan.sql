-- Migración para añadir columna 'acepta_plan'
ALTER TABLE public.casos_pos 
ADD COLUMN acepta_plan TEXT;
