CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'visor',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar un usuario administrador inicial
-- Email: admin@posmanager.com
-- Contraseña secreta para entrar: admin123
-- (el hash corresponde a 'admin123' encryptado con bcrypt)
INSERT INTO public.users (name, email, password_hash, role, active)
VALUES (
    'Admin Central', 
    'admin@posmanager.com', 
    '$2a$10$wTf/0kO.WkXl.7o5PpHvI.lC4mXWkRzKzV/.E/rY566PWej2z7k6e', 
    'admin', 
    true
)
ON CONFLICT (email) DO NOTHING;
