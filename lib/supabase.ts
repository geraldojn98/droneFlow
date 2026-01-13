import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Verificação de segurança
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO: Chaves do Supabase não encontradas no arquivo .env");
}

// O segredo está nesta linha: o "export" precisa estar exatamente assim
export const supabase = createClient(supabaseUrl, supabaseAnonKey);