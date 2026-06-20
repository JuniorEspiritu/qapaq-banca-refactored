import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key || key.includes('PEGA_AQUI')) {
  console.warn(
    '⚠️  SUPABASE_SERVICE_ROLE_KEY no configurada en backend/.env — ' +
    'las consultas a la base de datos fallarán hasta que la configures.'
  )
}

// Cliente con SERVICE ROLE: ignora RLS, solo se usa en el backend.
export const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})
