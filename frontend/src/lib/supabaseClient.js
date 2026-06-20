import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cliente con la anon key. Las tablas de negocio tienen RLS sin
// políticas para 'anon', así que el flujo principal pasa por la
// API del backend (VITE_API_URL). Este cliente queda disponible
// por si luego se usa Supabase Auth, Storage o Realtime.
export const supabase = createClient(url, anon)
