-- Migration: Auth & User Management

-- Ensure users table has the correct structure
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'visor',
    active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for email activation tokens
CREATE TABLE IF NOT EXISTS public.activation_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for token lookup
CREATE INDEX IF NOT EXISTS idx_activation_tokens_token ON public.activation_tokens(token);

-- Roles validation (optional but good practice)
-- roles: 'admin', 'supervisor', 'tecnico', 'visor'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_valid_role;
ALTER TABLE public.users ADD CONSTRAINT check_valid_role CHECK (role IN ('admin', 'supervisor', 'tecnico', 'visor'));

-- Insert initial admin if not exists (password: admin123)
-- Hash generated via bcrypt
INSERT INTO public.users (name, email, password_hash, role, active)
VALUES (
    'Administrador', 
    'admin@posmanager.com', 
    '$2a$10$wTf/0kO.WkXl.7o5PpHvI.lC4mXWkRzKzV/.E/rY566PWej2z7k6e', 
    'admin', 
    true
)
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    active = true;
