import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
if (typeof process !== 'undefined') dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
